const express = require('express');
const session = require('express-session');
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
    secret: 'sefa_kenger_ozel_gizli_anahtar',
    resave: false,
    saveUninitialized: false
}));

// Başlangıç HTML İçeriği
let siteHTML = `<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <title>Sefa Kenger - İnşaat & Proje Yönetimi</title>
    <style>
        body { font-family: sans-serif; margin: 0; padding: 0; background: #f8fafc; color: #1e293b; }
        header { background: #0f172a; color: white; padding: 30px; text-align: center; }
        .container { padding: 40px; max-width: 900px; margin: auto; background: white; margin-top: 20px; border-radius: 8px; }
    </style>
</head>
<body>
    <header>
        <h1>Sefa Kenger</h1>
        <p>İnşaat, Proje Yönetimi & Saha Deneyimleri</p>
    </header>
    <div class="container">
        <h2>Günlük Blog & Saha Notları</h2>
        <p>Saha tecrübelerimi ve günlük inşaat analizlerimi buradan takip edebilirsiniz.</p>
    </div>
</body>
</html>`;

// 1. ANA SAYFA
app.get('/', (req, res) => {
    res.send(siteHTML);
});

// 2. GİRİŞ SAYFASI
app.get('/login', (req, res) => {
    res.send(`
        <form action="/login" method="POST" style="max-width:320px;margin:100px auto;font-family:sans-serif;padding:20px;border:1px solid #ccc;border-radius:8px;">
            <h2 style="text-align:center;">Sefa Kenger Panel</h2>
            <input type="text" name="user" placeholder="Kullanıcı Adı" required style="width:100%;margin-bottom:12px;padding:10px;box-sizing:border-box;"><br>
            <input type="password" name="pass" placeholder="Şifre" required style="width:100%;margin-bottom:12px;padding:10px;box-sizing:border-box;"><br>
            <button type="submit" style="width:100%;padding:12px;background:#0f172a;color:white;border:none;border-radius:4px;cursor:pointer;">Giriş Yap</button>
        </form>
    `);
});

app.post('/login', (req, res) => {
    const { user, pass } = req.body;
    if (user === 'sefa' && pass === 'kenger123') {
        req.session.admin = true;
        res.redirect('/admin');
    } else {
        res.send("Hatalı kullanıcı adı veya şifre! <a href='/login'>Tekrar Dene</a>");
    }
});

// 3. CANLI DÜZENLEME PANELİ
app.get('/admin', (req, res) => {
    if (!req.session.admin) return res.redirect('/login');
    
    res.send(`
    <!DOCTYPE html>
    <html lang="tr">
    <head>
        <meta charset="UTF-8">
        <title>Sefa Kenger - HTML Düzenleme Paneli</title>
        <style>
            body { margin: 0; font-family: sans-serif; display: flex; flex-direction: column; height: 100vh; }
            .toolbar { background: #0f172a; color: white; padding: 12px 20px; display: flex; justify-content: space-between; align-items: center; }
            .main { display: flex; flex: 1; }
            textarea { width: 50%; height: 100%; border: none; background: #1e293b; color: #38bdf8; padding: 15px; font-family: monospace; font-size: 14px; box-sizing: border-box; }
            iframe { width: 50%; height: 100%; border: none; background: white; }
            button { background: #22c55e; color: white; border: none; padding: 10px 20px; cursor: pointer; font-weight: bold; border-radius: 4px; }
        </style>
    </head>
    <body>
        <div class="toolbar">
            <span><b>Sefa Kenger</b> - HTML Düzenleme Paneli</span>
            <button onclick="saveHTML()">KAYDET VE CANLIYA AL</button>
        </div>
        <div class="main">
            <textarea id="code" oninput="updatePreview()">${siteHTML}</textarea>
            <iframe id="preview"></iframe>
        </div>
        <script>
            function updatePreview() {
                const code = document.getElementById('code').value;
                const preview = document.getElementById('preview').contentWindow.document;
                preview.open();
                preview.write(code);
                preview.close();
            }
            updatePreview();

            async function saveHTML() {
                const code = document.getElementById('code').value;
                const res = await fetch('/api/save', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({ html: code })
                });
                if(res.ok) alert('Web siteniz başarıyla güncellendi!');
            }
        </script>
    </body>
    </html>
    `);
});

app.post('/api/save', (req, res) => {
    if (!req.session.admin) return res.status(403).send("Yetkisiz erişim");
    siteHTML = req.body.html;
    res.send({ status: "ok" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Sunucu ${PORT} portunda yayında.`));
