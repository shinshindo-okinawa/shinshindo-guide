/* 心身堂ご案内ページ ― 表示の仕組み（文章・画像の指定は data.js を直してください） */
(function () {
  "use strict";
  var D = window.SHINSHINDO;
  if (!D) return;

  /* ---------- ページごとの構成 ---------- */
  var LAYOUTS = {
    first:    [["features"], ["flow"], ["insurance"], ["courses", "all"], ["staff", "all"], ["equipment"], ["faq"]],
    regular:  [["plan"], ["wellness"], ["stages"], ["courses", "pain,fatigue,stretch,posture,constitution,physical"], ["goods", "all"], ["equipment"], ["staff", "toh,kinta,yara"]],
    accident: [["jibai"], ["courses", "accident,pain"], ["rousai"], ["staff", "all"]],
    sports:   [["school"], ["sportsIns"], ["courses", "sports-injury,pain,conditioning,sports-stretch,junior,sports-acu,physical"], ["goods", "carebox,supporter"], ["staff", "daiki,yara,toh"], ["equipment"], ["kidsMed", "short"]],
    mama:     [["mamaIntro"], ["courses", "mama,prenatal,pain,posture,constitution"], ["kidsMed"], ["wellness"], ["staff", "kinta"]],
    about:    [["aboutIntro"], ["troubles"], ["people"], ["services"], ["firstTime"]],
    symptoms: [["symCheck"], ["symList"], ["redFlags"], ["consult"], ["symFaq"]]
  };

  var SECTION_TITLES = {
    features: "心身堂の特徴", flow: "初めての方の流れ", insurance: "保険と自費の違い",
    courses: "コース", staff: "スタッフ紹介", equipment: "施術で使う機器", faq: "よくある質問",
    wellness: "Wellness Card", stages: "保険から自費への流れ", jibai: "交通事故（自賠責保険）",
    rousai: "労災保険", school: "学校でのケガ", sportsIns: "スポーツ保険",
    kidsMed: "医療費助成", mamaIntro: "ママが通いやすい環境",
    plan: "通院の5つのステップ", goods: "院で扱っている商品",
    symCheck: "症状チェック", symList: "お悩み一覧", redFlags: "先に医療機関へ", consult: "LINEで相談", symFaq: "よくある質問",
    aboutIntro: "このページについて", troubles: "こんなお悩みありませんか？", people: "こんな方にも\nご相談いただけます",
    services: "心身堂のサービス", firstTime: "初めてご利用される方へ"
  };

  var MARK = "img/logo_mark.png";
  var LOGO = "img/logo_white.png";          /* オレンジの帯の上に置く白いロゴ */
  var LOGO_FOOT = "img/logo_orange_full.jpg"; /* フッター用（オレンジ地のロゴ） */

  /* ---------- 小道具 ---------- */
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function br(s) { return esc(s).replace(/\n/g, "<br>"); }

  /* ---------- 読みやすい改行 ----------
     日本語の文節の切れ目（「〜を」「〜に」のあとなど）にだけ改行の候補を入れ、
     言葉の途中で折り返さないようにする。data.js の文章に「\n」を入れると、そこで必ず改行する。 */
  var HIRA = /[ぁ-ゖゝゞ]/;
  var AFTER = /[、。！？」』）・：]/;
  var BEFORE = /[「『（]/;
  var KEEP_PREFIX = /[おご]/;
  function phraseText(text) {
    var out = "", chars = Array.from(text);
    for (var i = 0; i < chars.length; i++) {
      var c = chars[i], n = chars[i + 1];
      out += c;
      if (n === undefined || n === "\n") continue;
      var brk = false;
      if (AFTER.test(c) && !AFTER.test(n)) brk = true;
      else if (BEFORE.test(n) && !BEFORE.test(c)) brk = true;
      else if (HIRA.test(c) && !HIRA.test(n) && !AFTER.test(n) && n !== "ー" && !/[\s&]/.test(n)) {
        brk = !(KEEP_PREFIX.test(c) && (i === 0 || !HIRA.test(chars[i - 1]) || /[のをにはがでともへや]/.test(chars[i - 1])));
      }
      if (brk) out += "<wbr>";
    }
    return out.replace(/\n/g, "<br>");
  }
  function phrase(html) {
    return html.replace(/>([^<]+)</g, function (m, text) { return ">" + phraseText(text) + "<"; });
  }
  function yen(n) { return n.toLocaleString("ja-JP") + "円"; }
  function man(n) { return n % 10000 === 0 ? (n / 10000) + "万円" : yen(n); }
  function list(items, cls) {
    return '<ul class="' + (cls || "dots") + '">' + items.map(function (i) { return "<li>" + esc(i) + "</li>"; }).join("") + "</ul>";
  }
  function steps(arr) {
    return '<ol class="steps">' + arr.map(function (s, i) {
      return '<li><span class="step-no" aria-hidden="true">' + (i + 1) + '</span><div><strong>' + esc(s.title) + "</strong>" + (s.text ? "<p>" + esc(s.text) + "</p>" : "") + "</div></li>";
    }).join("") + "</ol>";
  }
  function heading(title) {
    return '<h2 class="sec-h"><img src="' + MARK + '" alt="" aria-hidden="true">' + esc(title) + "</h2>";
  }
  function section(id, inner, title) {
    return '<section class="block" id="' + id + '">' + heading(title || SECTION_TITLES[id]) + inner + "</section>";
  }
  function staffById(id) { for (var i = 0; i < D.staff.length; i++) if (D.staff[i].id === id) return D.staff[i]; return null; }
  function courseById(id) { for (var i = 0; i < D.courses.length; i++) if (D.courses[i].id === id) return D.courses[i]; return null; }
  function shortName(s) { return s.name.replace(" ", ""); }
  function faces(ids) {
    if (!ids.length) {
      return '<span class="faces"><span class="faces-all">' + D.staff.map(function (s) {
        return s.photo ? '<img src="' + esc(s.photo) + '" alt="">' : "";
      }).join("") + '</span>スタッフ全員で対応</span>';
    }
    return '<span class="faces">' + ids.map(function (id) {
      var s = staffById(id); if (!s) return "";
      return '<span class="face">' + (s.photo ? '<img src="' + esc(s.photo) + '" alt="">' : "") + esc(shortName(s)) + "</span>";
    }).join("") + "</span>";
  }
  function cutPhoto(id, cls) {
    var s = staffById(id);
    return s && (s.cut || s.illust) ? '<img class="' + cls + '" src="' + esc(s.cut || s.illust) + '" alt="' + esc((s.role ? s.role + " " : "") + s.name) + 'の写真">' : "";
  }
  function illust(id, cls) {
    var s = staffById(id);
    return s && s.illust ? '<img class="' + cls + '" src="' + esc(s.illust) + '" alt="' + esc((s.role ? s.role + " " : "") + s.name) + 'のイラスト">' : "";
  }

  /* ---------- 各セクション ---------- */
  var R = {};

  R.features = function () {
    return section("features", '<div class="feature-grid">' + D.features.map(function (f) {
      return '<div class="feature"><h3>' + esc(f.title) + "</h3><p>" + esc(f.text) + "</p></div>";
    }).join("") + "</div>");
  };

  R.flow = function () {
    var img = D.about && D.about.welcomeImage ? '<img class="wide-img" src="' + esc(D.about.welcomeImage) + '" alt="笑顔で出迎える心身堂のスタッフ4名のイラスト">' : "";
    return section("flow", img + '<p class="lead-s">どのコースも、次の流れで進めます。</p>' + steps(D.flow));
  };

  R.insurance = function () {
    var I = D.insurance;
    var html = '<p class="lead-s">' + esc(I.lead) + "</p>" +
      '<div class="two-col">' +
        '<div class="ins ins-hoken"><p class="ins-tag">' + esc(I.hoken.name) + "</p><h3>" + esc(I.hoken.catch) + "</h3><p>" + esc(I.hoken.text) + "</p>" +
          '<p class="small-h">こんなケガが対象です</p>' + list(I.hoken.items) + '<p class="note">※' + esc(I.hoken.note) + "</p></div>" +
        '<div class="ins ins-jihi"><p class="ins-tag">' + esc(I.jihi.name) + "</p><h3>" + esc(I.jihi.catch) + "</h3><p>" + esc(I.jihi.text) + "</p>" +
          '<p class="small-h">こんな方におすすめです</p>' + list(I.jihi.items) + "</div>" +
      "</div>" +
      '<div class="callout callout-warn"><h3>' + esc(I.notCovered.title) + "</h3>" + list(I.notCovered.items, "cross") + "</div>" +
      '<div class="callout"><h3>病院にも通っている場合</h3><p>' + esc(I.hospital) + "</p></div>" +
      '<div class="callout"><h3>自費になる場合は、必ずご説明します</h3><p>' + esc(I.explain) + "</p></div>" +
      '<p class="policy">' + esc(I.policy) + "</p>";
    return section("insurance", html);
  };

  R.stages = function () {
    var I = D.insurance;
    var html = '<ol class="stages">' + I.stages.map(function (s) {
      var tag = s.type ? '<span class="pill pill-' + (s.type === "保険" ? "hoken" : "jihi") + '">' + esc(s.type) + "</span>" : "";
      return "<li>" + tag + '<p class="stage-when">' + esc(s.when) + "</p><p>" + esc(s.what) + "</p></li>";
    }).join("") + "</ol>" +
      '<div class="callout"><h3>自費になる場合は、必ずご説明します</h3><p>' + esc(I.explain) + "</p></div>" +
      '<p class="policy">' + esc(I.policy) + "</p>";
    return section("stages", html);
  };

  R.courses = function (arg) {
    var ids = arg === "all" ? D.courses.map(function (c) { return c.id; }) : arg.split(",");
    var groups = {}, order = [];
    ids.forEach(function (id) {
      var c = courseById(id); if (!c) return;
      if (!groups[c.group]) { groups[c.group] = []; order.push(c.group); }
      groups[c.group].push(c);
    });
    var hasNonAcu = ids.some(function (id) { var c = courseById(id); return c && !c.acupuncture && c.staff.length; });
    var html = '<p class="lead-s">' + esc(D.courseNote) + "</p>" + (hasNonAcu ? '<p class="staff-note">' + esc(D.staffNote) + "</p>" : "");
    order.forEach(function (g) {
      if (arg === "all") html += '<h3 class="group-h">' + esc(D.courseGroups[g]) + "</h3>";
      html += '<div class="courses">' + groups[g].map(function (c) {
        return '<details class="course" id="course-' + c.id + '"' + (ids.length === 1 ? " open" : "") + '><summary><span class="course-name">' + esc(c.name) + '</span><span class="course-catch">' + esc(c.catch) + "</span></summary>" +
          '<div class="course-body"><p class="small-h">こんな方に</p>' + list(c.forWho, "checks") + "<p>" + esc(c.text) + "</p>" +
          '<div class="course-staff"><span class="tag">' + (c.acupuncture || !c.staff.length ? "担当" : "得意なスタッフ") + "</span>" + faces(c.staff) + "</div></div></details>";
      }).join("") + "</div>";
    });
    var title = ids.length === 1 ? courseById(ids[0]).name : SECTION_TITLES.courses;
    return section("courses", html, title);
  };

  R.staff = function (arg) {
    var people = arg === "all" ? D.staff : arg.split(",").map(staffById).filter(Boolean);
    var group = D.groupPhoto && arg === "all" ? '<img class="group-photo" src="' + esc(D.groupPhoto) + '" alt="心身堂のスタッフ">' : "";
    var html = group + '<div class="staff-list">' + people.map(function (s) {
      var courses = s.courses.map(function (id) { var c = courseById(id); return c ? "<li>" + esc(c.name.replace("コース", "")) + "</li>" : ""; }).join("");
      return '<article class="staff">' +
        '<div class="staff-top">' + illust(s.id, "staff-ill") +
          '<div class="staff-name">' + (s.photo ? '<img class="staff-face" src="' + esc(s.photo) + '" alt="' + esc(s.name) + 'の写真">' : "") +
            '<p class="staff-role">' + esc(s.role || "スタッフ") + "</p>" +
            "<h3>" + esc(s.name) + (s.nickname ? ' <span class="nick">' + esc(s.nickname) + "</span>" : "") + "</h3>" +
            '<p class="tags-h">得意な分野</p><ul class="tags">' + courses + "</ul></div></div>" +
        '<p class="staff-profile">' + esc(s.profile) + '</p><p class="staff-comment">' + esc(s.comment) + "</p></article>";
    }).join("") + "</div>";
    return section("staff", html);
  };

  R.equipment = function () {
    var html = '<div class="equip-grid">' + D.equipment.map(function (e) {
      return '<div class="equip">' + (e.photo ? '<img src="' + esc(e.photo) + '" alt="' + esc(e.name) + 'の写真">' : "") +
        '<div class="equip-body"><h3>' + esc(e.name) + " <small>" + esc(e.sub) + "</small></h3>" + list(e.points) + "</div></div>";
    }).join("") + '</div><p class="note">' + esc(D.equipmentNote) + "</p>";
    return section("equipment", html);
  };

  R.plan = function () {
    var P = D.plan;
    var lead = (Array.isArray(P.lead) ? P.lead : [P.lead]).map(function (p) { return '<p class="lead-s">' + esc(p) + "</p>"; }).join("");
    var html = lead + '<ol class="journey">' + P.steps.map(function (s, i) {
      return '<li class="jstep jstep-' + i + '"><div class="jmark" aria-hidden="true"><span>STEP</span><b>' + (i + 1) + "</b></div>" +
        '<div class="jcard"><h3><span class="sr">STEP' + (i + 1) + "　</span>" + esc(s.title) + "</h3>" +
        '<p class="jtext">' + esc(s.text) + "</p>" +
        '<p class="jgoal"><span class="jgoal-h">目指す状態</span><span>' + esc(s.goal) + "</span></p>" +
        (s.freq ? '<p class="jfreq">通う間隔の目安：' + esc(s.freq) + "</p>" : "") + "</div></li>";
    }).join("") + "</ol>" +
      '<div class="callout"><h3>ステップの進み方は、一人ひとり違います</h3><p>' + esc(P.order) + '</p><p class="note">' + esc(P.note) + "</p></div>";
    return section("plan", html);
  };

  R.goods = function (arg) {
    var items = arg === "all" ? D.goods : arg.split(",").map(function (id) { for (var i = 0; i < D.goods.length; i++) if (D.goods[i].id === id) return D.goods[i]; return null; }).filter(Boolean);
    var html = '<div class="goods">' + items.map(function (g) {
      return '<div class="good"><h3>' + esc(g.name) + '</h3><p class="good-catch">' + esc(g.catch) + "</p>" + list(g.points) +
        (g.link ? '<p><a class="text-link" href="' + esc(g.link.url) + '" target="_blank" rel="noopener">' + esc(g.link.label) + "</a></p>" : "") + "</div>";
    }).join("") + '</div><p class="note">' + esc(D.goodsNote) + "</p>";
    return section("goods", html);
  };

  function philosophy() {
    var F = D.philosophy;
    return '<section class="block philosophy" id="philosophy">' + heading("心身堂の想い") +
      '<img class="phil-banner" src="' + esc(F.banner) + '" alt="' + esc(F.bannerAlt) + '">' +
      '<div class="phil-card"><p class="phil-h">' + esc(F.thinkingTitle) + '</p><p class="phil-text">' + F.thinking.map(esc).join("<br>") + "</p>" +
      (F.thinkingImage ? '<img class="phil-img" src="' + esc(F.thinkingImage) + '" alt="海辺で手でハートをつくる家族">' : "") + "</div>" +
      '<div class="phil-card"><p class="phil-h">' + esc(F.promiseTitle) + '</p><ol class="promises">' + F.promises.map(function (p, i) {
        return '<li><span class="promise-no promise-no-' + i + '">' + (i + 1) + "</span><span>" + esc(p) + "</span></li>";
      }).join("") + "</ol></div></section>";
  }

  function faqLink(l) {
    if (!l) return "";
    var L = D.clinic.links, href, cls = "btn-main", ext = true;
    if (l.to === "booking") href = L.booking.url;
    else if (l.to === "line") { href = L.line.url; cls = "btn-line"; }
    else { href = D.pages[l.to.replace("page:", "")].file; ext = false; }
    return '<p class="faq-act"><a class="btn ' + cls + '" href="' + esc(href) + '"' + (ext ? ' target="_blank" rel="noopener"' : "") + ">" + esc(l.label) + "</a></p>";
  }
  R.faq = function () {
    return section("faq", '<div class="faq">' + D.faq.map(function (f) {
      return "<details><summary>" + esc(f.q) + '</summary><div class="faq-a"><p>' + esc(f.a) + "</p>" +
        (f.items ? list(f.items, "checks") : "") + (f.after ? "<p>" + esc(f.after) + "</p>" : "") + faqLink(f.link) + "</div></details>";
    }).join("") + "</div>");
  };

  R.wellness = function () {
    var W = D.wellness;
    var html = '<p class="lead-s">' + esc(W.lead) + '</p><div class="plans">' + W.plans.map(function (p) {
      var pop = p.badge === "人気No.1";
      return '<div class="plan' + (pop ? " plan-pop" : "") + '"><p class="plan-badge">' + esc(p.badge || " ") + "</p>" +
        '<p class="plan-charge">' + man(p.charge) + '</p><p class="plan-bonus">+' + yen(p.bonus) + '分</p><p class="plan-label">' + esc(p.label) + "</p></div>";
    }).join("") + "</div>" + list(W.points, "checks") + '<p class="note">' + esc(W.note) + "</p>";
    return section("wellness", html, W.name);
  };

  R.jibai = function () {
    var J = D.systems.jibai;
    var html = '<p class="lead-s">' + esc(J.lead) + '</p><h3 class="sub-h">通院までの4ステップ</h3>' + steps(J.steps) +
      '<div class="callout"><h3>施術費用はどうなるの？</h3><p>' + esc(J.cost) + "</p></div>" +
      '<div class="callout callout-check"><h3>来院前にご確認ください</h3>' + list(J.before, "checks") + "</div>" +
      '<h3 class="sub-h">よくあるご質問</h3><div class="faq">' + J.faq.map(function (f) {
        return "<details><summary>" + esc(f.q) + "</summary><p>" + esc(f.a) + "</p></details>";
      }).join("") + '</div><p class="note">' + esc(J.disclaimer) + "</p>";
    return section("jibai", html, J.title);
  };

  R.rousai = function () {
    var S = D.systems.rousai;
    var html = '<p class="lead-s">' + esc(S.lead) + '</p><div class="callout"><h3>こんなときはご相談ください</h3>' + list(S.examples, "checks") + "</div>" +
      '<h3 class="sub-h">お手続きの流れ</h3>' + steps(S.steps) +
      '<h3 class="sub-h">申請に必要な書類</h3><div class="form-cards">' +
      S.forms.map(function (f) { return '<div class="form-card"><span>' + esc(f.kind) + "</span><strong>" + esc(f.form) + "</strong><small>" + esc(f.sub) + "</small></div>"; }).join("") +
      '</div><p class="note">※' + esc(S.formNote) + "</p>" +
      '<div class="callout callout-warn"><h3>通院時の注意点</h3>' + list(S.notes) + "</div>";
    return section("rousai", html, S.title);
  };

  R.school = function () {
    var S = D.systems.school;
    var html = '<p class="lead-s">' + esc(S.lead) + '</p><div class="callout"><h3>対象となる主な場面（例）</h3>' + list(S.scenes, "checks") + "</div>" +
      '<h3 class="sub-h">申請の流れ</h3>' + steps(S.steps) +
      '<div class="callout callout-check"><h3>保護者の方へ</h3>' + list(S.notes) + "</div>";
    return section("school", html, S.title);
  };

  R.sportsIns = function () {
    var S = D.systems.sportsIns;
    var html = '<p class="lead-s">' + esc(S.lead) + '</p><div class="two-col">' + S.types.map(function (t) {
      return '<div class="ins ins-plain"><h3>' + esc(t.name) + '</h3><p class="note">' + esc(t.sub) + '</p><p class="small-h">加入者</p><p>' + esc(t.who) +
        '</p><p class="small-h">補償の内容</p><p>' + esc(t.what) + '</p><p class="small-h">申請先</p><p>' + esc(t.where) + "</p></div>";
    }).join("") + "</div>" +
      '<h3 class="sub-h">保険の申請の流れ</h3>' + steps(S.steps) +
      '<div class="callout callout-check"><h3>心身堂からのお願い</h3>' + list(S.ask, "checks") + "</div>" +
      '<div class="callout"><h3>知っておきたいポイント</h3>' + list(S.notes) + "</div>";
    return section("sportsIns", html, S.title);
  };

  R.kidsMed = function (arg) {
    var K = D.systems.kidsMed;
    var contact = '<div class="contact-row"><span>' + esc(K.contact.name) + '</span><span class="tel-text">' + esc(K.contact.tel) + "</span></div>";
    if (arg === "short") {
      var s = '<p class="lead-s">' + esc(K.lead) + "</p>" + list(["子ども医療費助成：読谷村に住所がある0歳〜中学3年生まで", "ひとり親家庭等医療費助成：ひとり親家庭など"], "checks") +
        "<p>" + esc(K.method) + '</p><p class="note">※助成の対象は健康保険が使える施術だけです。</p>' +
        '<p><a class="text-link" href="' + D.pages.mama.file + '#kidsMed">医療費助成のくわしい説明を見る</a></p>' + contact;
      return section("kidsMed", s, K.title);
    }
    var programs = '<div class="two-col">' + K.programs.map(function (p) {
      return '<div class="ins ins-plain"><h3>' + esc(p.name) + '</h3><p class="small-h">対象</p><p>' + esc(p.who) + '</p><p class="small-h">助成の内容</p><p>' + esc(p.what) + '</p><p class="small-h">利用するときに必要なもの</p>' + list(p.bring, "checks") + "</div>";
    }).join("") + "</div>";
    var full = '<p class="lead-s">' + esc(K.lead) + "</p>" + programs +
      '<h3 class="sub-h">心身堂でのご利用の流れ</h3><p>' + esc(K.method) + "</p>" + steps(K.steps) +
      '<div class="callout callout-warn"><h3>ご注意ください</h3>' + list(K.notes) + "</div>" +
      '<p class="small-h">読谷村のお問い合わせ先</p>' + contact;
    return section("kidsMed", full, K.title);
  };

  R.mamaIntro = function () {
    var html = '<div class="feature-grid">' +
      '<div class="feature"><h3>キッズスペースあり</h3><p>小さなお子様と一緒でも、安心して施術を受けられます。</p>' + list(D.kidsItems, "checks") + "</div>" +
      '<div class="feature"><h3>ご予約のときにお伝えください</h3><p>お子様連れで来院される場合は、ご予約のときにお知らせください。</p></div>' +
      '<div class="feature"><h3>土日祝も受付</h3><p>ご家族の予定に合わせて通っていただけます。</p></div>' +
      '<div class="feature"><h3>まずは相談から</h3><p>無料健康相談を随時行っています。LINEでの事前相談もできます。</p></div>' +
      "</div>";
    return section("mamaIntro", html);
  };

  /* ---------- 心身堂について ---------- */
  var ICONS = {
    home: '<path d="M4 11.5 12 4l8 7.5"/><path d="M6.5 10v9.5h11V10"/><path d="M10 19.5v-5h4v5"/>',
    ball: '<circle cx="12" cy="12" r="8"/><path d="M12 4c2.5 2.2 3.8 4.9 3.8 8s-1.3 5.8-3.8 8"/><path d="M12 4c-2.5 2.2-3.8 4.9-3.8 8s1.3 5.8 3.8 8"/><path d="M4.5 9.5h15M4.5 14.5h15"/>',
    car: '<path d="M4 15.5V12l2-5h12l2 5v3.5z"/><path d="M4 12h16"/><circle cx="8" cy="17.5" r="1.8"/><circle cx="16" cy="17.5" r="1.8"/>',
    battery: '<rect x="3.5" y="8" width="15" height="9" rx="2"/><path d="M20.5 11v3"/><path d="M6.5 11v3"/>'
  };
  function icon(name) {
    return '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + (ICONS[name] || "") + "</svg>";
  }
  function pageLink(pageKey, hash) {
    var p = D.pages[pageKey];
    return p ? p.file + (hash ? "#" + hash : "") : "menu.html";
  }

  R.aboutIntro = function () {
    var A = D.about;
    var html = '<div class="q-bubbles">' + A.questions.map(function (q, i) { return '<p class="q-bubble q-bubble-' + i + '">' + br(q) + "</p>"; }).join("") + "</div>" +
      '<p class="q-answer">' + br(A.questionsText) + "</p>" +
      '<p class="lead-s">' + br(D.pages.about.heroText) + "</p>";
    return section("aboutIntro", html);
  };

  R.troubles = function () {
    var A = D.about;
    var html = '<p class="lead-s">' + esc(A.troublesLead) + '</p><p class="tick-hint">' + esc(A.tickHint) + '</p><div class="troubles">' +
      A.troubles.map(function (g) {
        return '<div class="trouble trouble-' + g.key + '"><div class="trouble-h">' + (g.image ? '<img class="cat-img" src="' + esc(g.image) + '" alt="">' : icon(g.icon)) + "<h3>" + esc(g.title) + "</h3></div>" +
          '<ul class="ticks">' + g.items.map(function (it) {
            return '<li><button type="button" class="tick" aria-pressed="false" data-tick="' + esc(it) + '"><span class="tick-box" aria-hidden="true"></span><span>' + esc(it) + "</span></button></li>";
          }).join("") + "</ul>" +
          '<a class="trouble-link" href="' + pageLink(g.link[0], g.link[2]) + '">' + esc(g.link[1]) + "</a></div>";
      }).join("") + "</div>" +
      '<div class="tick-result" id="tick-result" hidden><p class="tick-count"><span id="tick-count">0</span>個あてはまりました</p><p class="tick-msg">' + br(A.tickResult) + "</p>" +
        '<div class="actions actions-stack"><a class="btn btn-line" id="tick-line" href="' + esc(D.clinic.links.line.url) + '" target="_blank" rel="noopener">選んだ内容でLINE相談</a>' +
        '<a class="btn btn-main" href="' + D.pages.first.file + '">初めての方へのご案内</a></div></div>' +
      '<div class="callout"><p>' + br(A.troublesNote) + '</p><p><a class="text-link" href="' + D.pages.symptoms.file + '">身体の場所から探す・症状チェックはこちら</a></p></div>';
    return section("troubles", html);
  };

  R.people = function () {
    var A = D.about;
    var html = '<p class="lead-s">' + esc(A.peopleLead) + '</p><ul class="people">' + A.people.map(function (p, i) {
      return '<li><a class="person person-' + i + '" href="' + pageLink(p.page, p.hash) + '">' + (p.image ? '<img class="person-img" src="' + esc(p.image) + '" alt="">' : "") +
        "<strong>" + esc(p.who) + "</strong><span>" + esc(p.text) + "</span></a></li>";
    }).join("") + "</ul>" +
      '<div class="q-chips">' + A.peopleQuestions.map(function (q) { return '<span class="q-chip">' + esc(q) + "</span>"; }).join("") + "</div>" +
      '<p class="q-note">' + esc(A.peopleNote) + '</p><div class="actions"><a class="btn btn-line" href="' + esc(D.clinic.links.line.url) + '" target="_blank" rel="noopener">LINEで聞いてみる</a></div>';
    return section("people", html);
  };

  R.services = function () {
    var A = D.about;
    var html = '<p class="lead-s">' + esc(A.servicesLead) + '</p><div class="services">' + A.services.map(function (g, gi) {
      return '<div class="service service-' + gi + '"><h3><span class="service-no">' + (gi + 1) + "</span>" + esc(g.title) + "</h3><ul>" + g.items.map(function (it) {
        var c = courseById(it[1]);
        var page = c ? (c.group === "sports" || c.id === "sports-acu" ? "sports" : c.group === "mama" ? "mama" : "first") : "first";
        return '<li><a href="' + pageLink(page, c ? "course-" + c.id : "") + '">' + esc(it[0]) + "</a></li>";
      }).join("") + "</ul></div>";
    }).join("") + '</div><p class="note">項目を押すと、関係するコースの説明が開きます。</p>';
    return section("services", html);
  };

  R.firstTime = function () {
    var A = D.about;
    var html = (A.welcomeImage ? '<img class="wide-img" src="' + esc(A.welcomeImage) + '" alt="笑顔で出迎える心身堂のスタッフ4名のイラスト">' : "") +
      '<p class="lead-s">' + br(A.firstLead) + "</p>" + steps(A.firstSteps) +
      '<p class="first-note">' + esc(A.firstNote) + "</p>" +
      '<div class="actions actions-stack"><a class="btn btn-main" href="' + D.pages.first.file + '">初めての方へのご案内を見る</a>' +
      '<a class="btn btn-line" href="' + esc(D.clinic.links.line.url) + '" target="_blank" rel="noopener">LINEで相談</a></div>';
    return section("firstTime", html);
  };

  /* ---------- 症状から探す ---------- */
  function lineChatUrl(text) {
    var m = /\/p\/(@?[^/?#]+)/.exec(D.clinic.links.line.url);
    return m ? "https://line.me/R/oaMessage/" + m[1] + "/?" + encodeURIComponent(text) : D.clinic.links.line.url;
  }

  R.symCheck = function () {
    var S = D.symptoms;
    var html = '<div class="sym-check">' + (S.image ? '<img class="sym-img" src="' + esc(S.image) + '" alt="">' : "") + "<p>" + esc(S.checkLead) + "</p>" + list(S.checkPoints, "checks") +
      '<a class="btn btn-main sym-go" href="' + esc(S.checkUrl) + '" target="_blank" rel="noopener">' + esc(S.banner.check) + "</a></div>";
    return section("symCheck", html);
  };

  R.symList = function () {
    var S = D.symptoms;
    var map = "";
    if (S.bodymap) {
      map = '<div class="bodymap"><p class="bodymap-h">気になる場所を押してください</p><div class="bodymap-fig"><img src="' + esc(S.bodymap) + '" alt="身体の前とうしろのイラスト">' +
        '<span class="bm-cap bm-cap-front">前</span><span class="bm-cap bm-cap-back">うしろ</span>' +
        S.groups.map(function (g, i) {
          return g.spot ? '<a class="bm-spot" href="#sym-g' + i + '" style="left:' + g.spot[0] + "%;top:" + g.spot[1] + '%"><i aria-hidden="true"></i>' + esc(g.short || g.area) + "</a>" : "";
        }).join("") + '</div><p class="bodymap-h">場所以外のお悩み</p><div class="bm-chips">' +
        S.groups.map(function (g, i) { return g.spot ? "" : '<a class="sym-link" href="#sym-g' + i + '">' + esc(g.area) + "</a>"; }).join("") + "</div></div>";
    }
    var html = '<p class="lead-s">' + esc(S.listLead) + "</p>" + map + '<div class="sym-groups">' + S.groups.map(function (g, gi) {
      var links = g.links.map(function (l) {
        var c = courseById(l[1]), p = D.pages[l[0]];
        return c && p ? '<a class="sym-link" href="' + p.file + "#course-" + c.id + '">' + esc(c.name) + "</a>" : "";
      }).join("");
      return '<div class="sym-group" id="sym-g' + gi + '"><h3>' + esc(g.area) + "</h3>" + list(g.items) +
        '<p class="small-h">合うコース</p><div class="sym-links">' + links + "</div></div>";
    }).join("") + '</div><div class="callout"><h3>保険は使えますか？</h3><p>' + esc(S.insuranceNote) + "</p></div>";
    return section("symList", html);
  };

  R.redFlags = function () {
    var S = D.symptoms;
    return section("redFlags", '<div class="callout callout-warn"><p>' + esc(S.redFlagsLead) + "</p>" + list(S.redFlags) + "</div>", "こんなときは、先に医療機関へ");
  };

  R.consult = function () {
    var S = D.symptoms;
    var html = '<p class="lead-s">' + esc(S.consultLead) + '</p><ol class="consult-items">' + S.consultItems.map(function (c) { return "<li>" + esc(c) + "</li>"; }).join("") + "</ol>" +
      '<div class="consult-box"><p class="small-h">送るときのひな形</p><pre class="consult-tpl">' + esc(S.consultTemplate) + "</pre>" +
      '<div class="actions"><a class="btn btn-line" href="' + esc(lineChatUrl(S.consultTemplate)) + '" target="_blank" rel="noopener">ひな形つきでLINEを開く</a>' +
      '<button type="button" class="btn btn-sub" data-copy="' + esc(S.consultTemplate) + '">ひな形をコピー</button></div>' +
      '<p class="note">LINEが開いたら、①〜④を書き足して送ってください。うまく開かないときは、ひな形をコピーしてLINEに貼り付けてください。</p></div>';
    return section("consult", html, "わからないときは、LINEで相談");
  };

  R.symFaq = function () {
    return section("symFaq", '<div class="faq">' + D.symptoms.faq.map(function (f) {
      return "<details><summary>" + esc(f.q) + "</summary><p>" + esc(f.a) + "</p></details>";
    }).join("") + "</div>");
  };

  function symptomBanner() {
    var B = D.symptoms.banner;
    return '<div class="sym-banner">' + (D.symptoms.image ? '<img class="sym-img" src="' + esc(D.symptoms.image) + '" alt="身体の気になる場所と、虫めがね・チェックリストのイラスト">' : "") + '<p class="sym-label">' + esc(B.label) + '</p><p class="sym-title">' + br(B.title) + '</p><p class="sym-text">' + br(B.text) + "</p>" +
      '<div class="sym-btns"><a class="btn btn-main" href="' + esc(D.symptoms.checkUrl) + '" target="_blank" rel="noopener">' + esc(B.check) + "</a>" +
      '<a class="btn btn-outline" href="' + D.pages.symptoms.file + '">' + esc(B.list) + "</a></div></div>";
  }

  /* ---------- 共通部分 ---------- */
  function actions(onOrange) {
    var L = D.clinic.links;
    return '<div class="actions"><a class="btn ' + (onOrange ? "btn-white" : "btn-main") + '" href="' + L.booking.url + '" target="_blank" rel="noopener">WEB予約する</a>' +
      '<a class="btn btn-line" href="' + L.line.url + '" target="_blank" rel="noopener">LINEで相談</a></div>';
  }

  function infoBlock() {
    var C = D.clinic, L = C.links, t = C.tel;
    return '<footer class="info" id="info"><div class="wrap">' +
      '<img class="info-logo" src="' + LOGO_FOOT + '" alt="心身堂 shinshindo">' +
      "<h2>" + esc(C.name) + "</h2>" +
      '<div class="info-grid"><div><p class="info-h">受付時間</p><table class="hours"><tbody>' +
      C.hours.map(function (h) { return '<tr><th scope="row">' + esc(h.label) + "</th><td>" + esc(h.time) + "</td></tr>"; }).join("") +
      "</tbody></table><p>" + esc(C.hoursNote) + "</p></div>" +
      '<div><p class="info-h">住所・アクセス</p><p>' + esc(C.postal) + "<br>" + esc(C.address) + "</p>" + list(C.access) + "</div>" +
      '<div><p class="info-h">お電話</p><p class="phone-row"><span class="tel-text" id="tel-text">' + esc(t) + '</span></p>' +
      '<p class="phone-btns"><a class="mini-btn" href="tel:' + t.replace(/-/g, "") + '">電話をかける</a><button type="button" class="mini-btn" data-copy="' + esc(t) + '">番号をコピー</button></p>' +
      actions(false) +
      '<p class="sns"><a href="' + L.instagram.url + '" target="_blank" rel="noopener">Instagram</a><a href="' + L.homepage.url + '" target="_blank" rel="noopener">ホームページ</a></p></div></div>' +
      '<p class="copy">© ' + esc(C.name) + "</p></div></footer>";
  }

  function menuCards(exclude) {
    return Object.keys(D.pages).filter(function (k) { return k !== exclude && !D.pages[k].special; }).map(function (k) {
      var p = D.pages[k];
      var pic = p.cardStaff ? illust(p.cardStaff, "card-ill") : '<img class="card-mark" src="' + MARK + '" alt="">';
      return '<li><a class="menu-card" href="' + p.file + '"><span class="menu-text"><span class="menu-label">' + esc(p.label) + "</span>" +
        "<strong>" + esc(p.title) + '</strong><span class="menu-desc">' + esc(p.lineCard) + '</span><span class="menu-go">ご案内を見る</span></span>' + pic + "</a></li>";
    }).join("");
  }

  function brandBar() {
    return '<div class="brandbar"><img src="' + LOGO + '" alt="心身堂 shinshindo"><span>読谷院</span></div>';
  }

  /* ---------- ページの組み立て ---------- */
  function buildPage(key) {
    var P = D.pages[key];
    var layout = LAYOUTS[key];
    var toc = '<nav class="toc" aria-label="このページの目次"><ul>' + layout.map(function (item) {
      var id = item[0], label = SECTION_TITLES[id];
      if (id === "courses" && item[1] !== "all" && item[1].split(",").length === 1) label = courseById(item[1]).name;
      return '<li><a href="#' + id + '">' + esc(label.replace(/\n/g, "")) + "</a></li>";
    }).join("") + '<li><a href="#info">アクセス</a></li></ul></nav>';
    var people = (P.heroStaff || []).map(function (id, i) { return illust(id, "hero-ill hero-ill-" + i); }).join("");

    return draftBar() +
      '<header class="hero hero-page"><div class="wrap">' + brandBar() +
        '<div class="hero-text"><p class="eyebrow">' + esc(P.eyebrow || P.title) + "</p><h1>" + esc(P.hero) + '</h1><p class="hero-lead">' + esc(P.lead) + "</p></div>" +
        '<div class="hero-foot">' + actions(true) +
        '<div class="hero-people hero-people-' + (P.heroStaff || []).length + '" aria-hidden="true">' + people + "</div></div>" +
        '</div></header><div class="band" aria-hidden="true"></div>' +
      '<main class="wrap">' + toc + layout.map(function (item) { return R[item[0]](item[1]); }).join("") + "</main>" +
      '<nav class="others" aria-label="ほかのご案内"><div class="wrap">' + heading("ほかのご案内") + (key === "symptoms" ? "" : symptomBanner()) + '<ul class="menu-cards">' + menuCards(key) +
        (key === "about" ? "" : '<li><a class="menu-card menu-card-all" href="' + D.pages.about.file + '"><span class="menu-text"><strong>心身堂鍼灸整骨院について</strong></span></a></li>') +
        '<li><a class="menu-card menu-card-all" href="menu.html"><span class="menu-text"><strong>ご案内メニューへ戻る</strong></span></a></li></ul></div></nav>' +
      infoBlock();
  }

  function buildMenu() {
    var M = D.menu;
    var people = M.heroStaff.map(function (id, i) { return cutPhoto(id, "row-ill row-ill-" + i); }).join("");
    return draftBar() +
      '<header class="hero hero-menu"><div class="wrap">' + brandBar() +
        '<p class="tagline">' + esc(M.tagline) + '</p><h1 class="menu-title">' + esc(M.title) + "</h1>" +
        '<p class="menu-intro">' + br(M.intro) + '</p><p class="hero-lead">' + br(M.purpose) + "</p>" +
        '<a class="about-card" href="' + D.pages.about.file + '"><img src="' + MARK + '" alt="" aria-hidden="true">' +
          '<span class="about-card-text"><span class="about-card-sub">心身堂ってどんなところ？</span><strong>心身堂について詳しく見る</strong>' +
          '<span class="about-card-desc">特徴・サービス・お悩みのご相談</span></span><span class="about-card-go" aria-hidden="true">›</span></a>' +
        '<div class="staff-row" aria-hidden="true">' + people + "</div></div></header>" +
      '<div class="band" aria-hidden="true"></div>' +
      '<main class="wrap"><div class="menu-top"><div class="ask"><p class="bubble">' + br(M.bubble) + '</p><p class="ask-lead">' + esc(M.lead) + "</p></div>" + symptomBanner() +
        '<p class="ask-or">または、あてはまる方を選んでください</p><ul class="menu-cards">' + menuCards("") + "</ul></div>" + philosophy() + "</main>" + infoBlock();
  }

  function draftBar() {
    var show = D.draft === "preview" ? !/github\.io$/.test(location.hostname) : !!D.draft;
    return show ? '<p class="draft-bar">公開前の下書きです。<a href="line-cards.html">院内用：LINEカード設定</a></p>' : "";
  }

  /* ---------- 起動 ---------- */
  function start() {
    var root = document.getElementById("app");
    if (!root) return;
    var key = root.getAttribute("data-page");
    root.innerHTML = phrase(key === "menu" ? buildMenu() : (D.pages[key] ? buildPage(key) : ""));
    document.title = (key === "menu" ? "ご案内メニュー" : D.pages[key].title) + "｜" + D.clinic.shortName;

    root.addEventListener("click", function (e) {
      var b = e.target.closest ? e.target.closest("[data-copy]") : null;
      if (!b) return;
      var done = function () { var o = b.textContent; b.textContent = "コピーしました"; setTimeout(function () { b.textContent = o; }, 1600); };
      try { navigator.clipboard.writeText(b.getAttribute("data-copy")).then(done, selectTel); } catch (err) { selectTel(); }
    });

    /* 「こんなお悩みありませんか？」のチェック */
    root.addEventListener("click", function (e) {
      var b = e.target.closest ? e.target.closest("[data-tick]") : null;
      if (!b) return;
      b.setAttribute("aria-pressed", b.getAttribute("aria-pressed") === "true" ? "false" : "true");
      var picked = Array.prototype.slice.call(root.querySelectorAll('[data-tick][aria-pressed="true"]')).map(function (x) { return x.getAttribute("data-tick"); });
      var box = document.getElementById("tick-result");
      if (!box) return;
      box.hidden = picked.length === 0;
      document.getElementById("tick-count").textContent = picked.length;
      document.getElementById("tick-line").href = lineChatUrl("【ご相談】\nあてはまるお悩み：\n・" + picked.join("\n・") + "\n\nいつから：\nいま困っていること：");
    });

    /* ページを開いたら必ず一番上から表示する（#付きのリンクのときだけ、その場所へ） */
    try { if ("scrollRestoration" in history) history.scrollRestoration = "manual"; } catch (err) { /* 使えない環境では何もしない */ }
    var target = location.hash ? document.getElementById(location.hash.slice(1)) : null;
    var place = function () {
      if (target) { if (target.tagName === "DETAILS") target.open = true; target.scrollIntoView(); }
      else window.scrollTo(0, 0);
    };
    var touched = false;
    ["wheel", "touchstart", "keydown"].forEach(function (ev) { window.addEventListener(ev, function () { touched = true; }, { once: true, passive: true }); });
    var placeIfIdle = function () { if (!touched) place(); };
    place();
    requestAnimationFrame(placeIfIdle);
    window.addEventListener("load", placeIfIdle, { once: true });
    setTimeout(placeIfIdle, 150);
    setTimeout(placeIfIdle, 500);
    window.addEventListener("pageshow", function (e) { if (e.persisted) window.scrollTo(0, 0); });

    /* 上へ戻るボタン */
    var up = document.createElement("a");
    up.href = "#top"; up.className = "to-top"; up.textContent = "上へ"; up.setAttribute("aria-label", "ページの上へ戻る");
    up.addEventListener("click", function (e) { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); });
    root.appendChild(up);
    var toggle = function () { up.classList.toggle("show", window.scrollY > 600); };
    window.addEventListener("scroll", toggle, { passive: true }); toggle();
  }
  function selectTel() {
    var el = document.getElementById("tel-text");
    if (!el) return;
    var r = document.createRange(); r.selectNodeContents(el);
    var s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
