/* The Shop: power-ups, crates, themes, avatars. Everything level-gated as well as priced. */
window.EN = window.EN || {};
EN.Screens = EN.Screens || {};

EN.Screens.shop = function (view) {
  const U = EN.U, S = EN.State, UI = EN.UI;
  const d = S.data;

  view.appendChild(U.el("h1", { text: "🛒 Shop" }));
  view.appendChild(U.el("p", { class: "muted",
    text: "You have " + d.coins.toLocaleString() + " ✒️ Marks. Payouts run at 60%, so Marks stay scarce on purpose." }));

  view.appendChild(U.el("h2", { text: "Power-ups" }));
  const pg = U.el("div", { class: "grid g3" });
  EN.DATA.shop.powerups.forEach(p => {
    const locked = d.level < p.level;
    const have = d.inventory[p.id] || 0;
    pg.appendChild(U.el("div", { class: "shop-item" }, [
      U.el("div", { class: "row" }, [
        U.el("span", { class: "shop-ico", text: p.icon }),
        U.el("div", { class: "spacer" }),
        U.el("span", { class: "chip", text: "×" + have })
      ]),
      U.el("div", { class: "shop-name", text: p.name }),
      U.el("div", { class: "shop-desc", text: p.desc }),
      U.el("button", {
        class: "btn btn-sm " + (locked ? "btn-ghost" : "btn-primary"),
        text: locked ? "🔒 Level " + p.level : p.price + " ✒️",
        disabled: locked,
        on: { click: () => {
          if (S.spendCoins(p.price)) { S.grantPowerup(p.id); EN.Sound.purchase(); UI.handleRoute(); }
          else { EN.Sound.denied(); UI.toast({ icon: "✒️", kind: "bad", text: "Not enough Marks." }); }
        } }
      })
    ]));
  });
  view.appendChild(pg);

  view.appendChild(U.el("h2", { text: "Supply crates" }));
  const cg = U.el("div", { class: "grid g3" });
  EN.DATA.shop.crates.forEach(c => {
    const locked = d.level < c.level;
    cg.appendChild(U.el("div", { class: "shop-item crate" }, [
      U.el("div", { class: "crate-box", text: c.icon }),
      U.el("div", { class: "shop-name", text: c.name }),
      U.el("div", { class: "shop-desc", text: c.desc }),
      U.el("button", {
        class: "btn btn-sm " + (locked ? "btn-ghost" : "btn-primary"),
        text: locked ? "🔒 Level " + c.level : c.price + " ✒️",
        disabled: locked,
        on: { click: () => openCrate(c) }
      })
    ]));
  });
  view.appendChild(cg);

  view.appendChild(U.el("h2", { text: "Themes" }));
  const tg = U.el("div", { class: "grid g3" });
  EN.DATA.themes.forEach(t => {
    const owned = S.ownsTheme(t.id);
    const locked = d.level < t.level;
    const active = d.profile.theme === t.id;
    tg.appendChild(U.el("div", { class: "shop-item" + (owned ? " owned" : "") }, [
      U.el("div", { class: "theme-dots" }, t.dots.map(c =>
        U.el("span", { class: "theme-dot", style: "background:" + c }))),
      U.el("div", { class: "shop-name", text: t.name }),
      U.el("div", { class: "shop-desc", text: t.desc }),
      owned
        ? U.el("button", { class: "btn btn-sm " + (active ? "btn-ghost" : "btn-primary"),
            text: active ? "✓ Active" : "Use", disabled: active,
            on: { click: () => { UI.applyTheme(t.id); EN.Sound.equip(); UI.handleRoute(); } } })
        : U.el("button", { class: "btn btn-sm " + (locked ? "btn-ghost" : "btn-primary"),
            text: locked ? "🔒 Level " + t.level : t.price + " ✒️", disabled: locked,
            on: { click: () => {
              if (S.spendCoins(t.price)) {
                d.owned.themes.push(t.id); UI.applyTheme(t.id);
                EN.Sound.unlock(); EN.FX.confetti(70); UI.handleRoute();
              } else { EN.Sound.denied(); UI.toast({ icon: "✒️", kind: "bad", text: "Not enough Marks." }); }
            } } })
    ]));
  });
  view.appendChild(tg);

  view.appendChild(U.el("h2", { text: "Avatars" }));
  const ag = U.el("div", { class: "emoji-pick" });
  EN.DATA.avatars.forEach(a => {
    const owned = S.ownsAvatar(a.em);
    const locked = d.level < a.level;
    const b = U.el("button", {
      class: "emoji-opt" + (d.profile.avatar === a.em ? " on" : "") + (!owned && locked ? " lock" : ""),
      type: "button", text: a.em,
      title: owned ? "Owned" : locked ? "Level " + a.level : a.price + " Marks"
    });
    b.addEventListener("click", () => {
      if (owned) { d.profile.avatar = a.em; S.emit(); EN.Sound.equip(); UI.handleRoute(); return; }
      if (locked) { EN.Sound.denied(); UI.toast({ icon: "🔒", kind: "bad", text: "Unlocks at level " + a.level + "." }); return; }
      if (S.spendCoins(a.price)) {
        d.owned.avatars.push(a.em); d.profile.avatar = a.em; S.emit();
        EN.Sound.unlock(); UI.handleRoute();
      } else { EN.Sound.denied(); UI.toast({ icon: "✒️", kind: "bad", text: "Not enough Marks." }); }
    });
    ag.appendChild(b);
  });
  view.appendChild(ag);

  view.appendChild(U.el("h2", { text: "Arcade time" }));
  view.appendChild(U.el("p", { class: "muted",
    text: "Rent playtime for the three arcade games. They earn no XP and no Marks — only a high score." }));
  view.appendChild(U.el("button", { class: "btn btn-ghost btn-block", text: "🕹️ Go to the Arcade",
                                    on: { click: () => UI.go("/arcade") } }));

  function openCrate(c) {
    if (!S.spendCoins(c.price)) {
      EN.Sound.denied();
      UI.toast({ icon: "✒️", kind: "bad", text: "Not enough Marks." });
      return;
    }
    const total = c.table.reduce((n, [, w]) => n + w, 0);
    const got = {};
    for (let i = 0; i < c.rolls; i++) {
      let r = Math.random() * total;
      for (const [id, w] of c.table) {
        r -= w;
        if (r <= 0) { S.grantPowerup(id); got[id] = (got[id] || 0) + 1; break; }
      }
    }
    EN.Sound.open();
    const rare = Object.keys(got).some(k => k === "adrenaline" || k === "insight");
    if (rare) { EN.Sound.rareDrop(); EN.FX.confetti(110); }
    const box = U.el("div", { class: "modal-center" }, [
      U.el("div", { class: "modal-big", text: c.icon }),
      U.el("h2", { text: c.name + " opened" }),
      U.el("div", { class: "grid", style: "margin:14px 0" },
        Object.entries(got).map(([id, n]) => {
          const p = EN.DATA.shop.powerups.find(x => x.id === id);
          return U.el("div", { class: "row" }, [
            U.el("span", { style: "font-size:20px", text: p.icon }),
            U.el("span", { text: p.name }),
            U.el("div", { class: "spacer" }),
            U.el("span", { class: "chip on", text: "×" + n })
          ]);
        })),
      U.el("button", { class: "btn btn-primary btn-block", text: "Take it",
        on: { click: () => { UI.closeModal(); UI.handleRoute(); } } })
    ]);
    UI.modal(box, { sticky: true });
  }
};
