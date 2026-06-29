# Debarro – AI Prompt Template Gyűjtemény
> Saját referencia: új gépre onboarding + projekt-reprodukció

---

## 1. STACK INSTALL PROMPT
> Másold be egy AI-ba (Claude / Copilot) ha új gépre kell feltelepíteni mindent.

```
Te egy senior fullstack fejlesztő vagy, aki segít egy Windows 11 gépen
feltelepíteni egy meglévő ERP projekt teljes fejlesztői környezetét.

## A projekt neve: De Barro ERP
## Stack:
- Python 3.12.x
- FastAPI + Uvicorn (REST API backend)
- pandas, polars, numpy (adatelemzés)
- MySQL 8.4 Community Server (lokális, Windows service)
- DuckDB 1.5.x (lokális analitika)
- MongoDB (pymongo) 
- Anthropic SDK 0.109.x (AI réteg)
- OpenAI Whisper + Torch (hang/AI)
- openpyxl, python-docx, reportlab (fájlgenerálás)
- python-dotenv (env kezelés)
- Node.js v24.x + npm 11.x
- React (Create React App) + Ant Design (frontend)
- VS Code extensions: ms-python.vscode-pylance, ms-python.vscode-python-envs,
  mtxr.sqltools, mtxr.sqltools-driver-mysql

## Mappastruktúra:
C:\projektek\debarro\
├── DEBARRO-PYTHON\      # FastAPI backend (main.py, database.py, auth.py)
├── DEBARRO-SQL\         # SQL schema fájlok
├── DEBARRO-FUVAROZAS\   # GPS/fleet analytics Python scriptek
├── debarro-frontend\    # React SPA
├── start_debarro.bat    # dupla kattintásra indít mindent
├── .env / validate.env  # titkos kulcsok (nem gitbe)
└── requirements.txt     # Python dependencies

## Feladat:
Generálj egy lépésről-lépésre telepítési útmutatót Windows 11 PowerShell
környezethez, amely tartalmazza:
1. Szükséges szoftverek telepítése (winget parancsokkal ahol lehetséges)
2. Python virtual environment létrehozása a projekt mappájában
3. pip install -r requirements.txt (és lehetséges hibák)
4. MySQL 8.4 inicializálása és service indítás
5. Node.js és npm ellenőrzés
6. VS Code extension-ök telepítése parancssori módon
7. .env fájl sablon létrehozása a szükséges változókkal
8. start_debarro.bat struktúrája és tesztelés

Fontos: minden lépésnél jelezd ha Windows-specifikus buktatók várhatók
(PATH beállítás, service regisztráció, UTF-8 encoding stb.)
```

---

## 2. ADATBÁZIS SCHEMA REPRODUKÁLÓ PROMPT
> Ha egy modult nulláról kell újraépíteni vagy új AI-nak elmagyarázni.

```
Te egy MySQL adatbázis-architekt vagy. A következő ERP rendszer
adatmodelljét kell megértenem / újraépítenem.

## Rendszer: De Barro ERP – Üzemanyag & Eszköznyilvántartó modul

## Naming convention (prefix alapú moduláris schema):
| Prefix    | Modul                                    |
|-----------|------------------------------------------|
| core_     | törzsadatok (cég, lokáció, munkaerő, idő)|
| ua_       | üzemanyag modul                          |
| eszkoz_   | eszközpark / járművek                    |
| proj_     | projektek (stub)                         |
| hr_       | humán (stub)                             |
| fin_      | financiális (stub)                       |
| users_    | authentikáció                            |

## Üzleti logika (FONTOS):
- Soft delete mindenhol: rekordok soha nem törlődnek, csak allapot = 'INAKTÍV'
- Trigger-alapú validáció CHECK constraint helyett (KKV tolerancia: adat bekerül,
  rendszer jelzi a hibát)
- ervenyes = 1/0 jelző minden fact táblán (trigger állítja)
- hiba_uzenet VARCHAR mező minden fact táblán (trigger tölti)
- ua_dim_keszlet tábla: valós idejű tartálykészlet, triggerek frissítik
- datum_id = YYYYMMDD formátum (data warehouse konvenció)

## Fő táblák (ua_ modul):
- ua_dim_tartaly (tartályszám, típus: FIX/MOBIL/KANNA, kapacitás, anyag FK, lokáció FK)
- ua_dim_fogyoanyag (megnevezés, kategória, tulajdonos cég FK)
- ua_dim_keszlet (tartályonként 1 sor, aktualis_liter, trigger frissíti)
- ua_fact_keszlet_bevet (bevételezések: zaro_liter, bejovo_liter, szallito FK)
- ua_fact_keszlet_kiadas (kiadások: kiadott_liter, km_allapot, uzemora, eszkoz FK)
- ua_fact_keszlet_mozgas (mozgások: forras_tartaly FK, cel_tartaly FK, liter)

## Trigger logika:
- trg_bevet_validate: záró−kezdő=bejövő (±0.5L tűrés), kapacitás limit
- trg_kiadas_validate: készlethiány = HIBA (ervenyes=0), km/üzemóra sorrend
- trg_mozgas_validate: pisztoly óraállás vs liter, 2% tűrés = FIGYELMEZTETÉS

## API válasz struktúra (FastAPI POST endpointok):
{ "id": int, "ervenyes": 0|1, "hiba_uzenet": null|"HIBA: ..."|"FIGYELMEZTETÉS: ..." }

## Feladat:
[IDE ÍRD MIT SZERETNÉL – pl. "Generáld le az ua_ modul teljes schema SQL-jét"
vagy "Magyarázd el a trigger logikát és írj tesztadatokat"]
```

---

## 3. FASTAPI BACKEND REPRODUKÁLÓ PROMPT

```
Te egy Python FastAPI senior fejlesztő vagy.

## Projekt: De Barro ERP backend
## Stack: Python 3.12, FastAPI, Uvicorn, mysql-connector-python, python-dotenv,
          passlib[bcrypt], python-jose[cryptography]

## Fájlstruktúra:
DEBARRO-PYTHON/
├── main.py        # összes endpoint
├── database.py    # MySQL kapcsolat (dotenv-ből)
├── auth.py        # JWT + bcrypt authentikáció
├── seed_users.py  # tesztuser generálás
└── validate.env   # DB_HOST, DB_USER, DB_PASS, DB_NAME, JWT_SECRET, EXPIRE_HOURS

## Auth rendszer:
- JWT token, 8 óra lejárat, SECRET_KEY .env-ből
- bcrypt==4.0.1 (4.x felett passlib inkompatibilis!)
- get_current_user() – FastAPI Depends() kapus
- require_role(modul, tier) – modul + tier alapú jogosultság
- Szerepkör konvenció: UA_1, UA_2, UA_3, ADMIN_1, HR_1 stb.
  (kisebb tier szám = több jog)

## CORS:
allow_origins=["http://localhost:3000"]  # React dev server

## Endpoint konvenció:
GET  /{entity}              – listázás (dim táblák)
POST /{entity}              – új rekord, válasz: {id, ervenyes, hiba_uzenet}
PATCH /{entity}/{id}        – teljes rekord szerkesztés
PATCH /{entity}/{id}/allapot – csak AKTÍV/INAKTÍV váltás
GET  /tranzakciok/{tipus}?tartaly_id=&datum_tol=&datum_ig=  – szűrt history

## Indítás:
cd C:\projektek\debarro\DEBARRO-PYTHON
uvicorn main:app --reload
# Swagger: http://localhost:8000/docs

## Feladat:
[IDE ÍRD MIT SZERETNÉL – pl. "Írj egy új endpointot a proj_ modulhoz"
vagy "Refaktoráld a main.py-t APIRouter-rel modulonként"]
```

---

## 4. REACT FRONTEND REPRODUKÁLÓ PROMPT

```
Te egy React senior fejlesztő vagy, Ant Design tapasztalattal.

## Projekt: De Barro ERP frontend
## Stack: React (CRA), React Router DOM, Ant Design (dark theme), CSS modulok

## URL struktúra:
/                    → ModulValaszto.js (főoldal, 4 modul kártya)
/uzemanyag           → UA dashboard
/uzemanyag/kiadas    → KiadasForm.js
/uzemanyag/mozgas    → MozgasForm.js
/uzemanyag/bevet     → BevetelezesForm.js
/uzemanyag/elozmeny  → Tranzakciok.js
/admin/torzsadatok   → Torzsadatok.js
/login               → LoginPage.js

## Auth:
- JWT token localStorage-ban ("token" kulcs)
- user adatok localStorage-ban ("user" kulcs, tartalmazza: username, szerepkor)
- ProtectedRoute.js wrapper – token nélkül → redirect /login
- Logout: localStorage.clear() + redirect /login

## Fontos React tanulság (disabled Input):
// ROSSZ: disabled mező nem kerül be a form values-ba
anyag_megnevezes: values.anyag_megnevezes  // undefined!

// JÓ: kézzel add hozzá a payload-hoz
anyag_megnevezes: tartalyok.find(t => t.id === values.tartaly_id)?.anyag_megnevezes || ""

## API kommunikáció:
- Base URL: http://localhost:8000
- Authorization header: Bearer ${localStorage.getItem("token")}
- POST válasz struktúra: { id, ervenyes, hiba_uzenet }
  → ervenyes=1 + hiba_uzenet=null → zöld OK
  → ervenyes=1 + "FIGYELMEZTETÉS" → sárga warning
  → ervenyes=0 + "HIBA" → piros error

## Modul kártyák (ModulValaszto):
ÜZEMANYAG (aktív, narancssárga) | HUMÁN (disabled) | PÉNZÜGY (disabled) | ADMIN (aktív)

## Feladat:
[IDE ÍRD MIT SZERETNÉL – pl. "Írj egy új Ant Design form komponenst a proj_ modulhoz"
vagy "Implementáld a frontend oldalon a szerepkör alapú menü elrejtést"]
```

---

## 5. FLEET ANALYTICS PROMPT (iFleet GPS)
> DEBARRO-FUVAROZAS mappa

```
Te egy Python adatelemző senior vagy, pandas és openpyxl tapasztalattal.

## Feladat kontextus: De Barro Kft. – Tatabánya bánya ↔ M1 COLAS/ORLEN fuvarozás

## iFleet GPS export típusok:
- bővített riport (XLS): esemény log, GPS koordináta string, km, sebesség
  → FONTOS: passive GPS ping ≠ gyújtás esemény (gyújtás: ki soroknál is van ping)
- munkaidő kimutatás (XLS): napi gyújtás BE/KI timestamp per jármű (tachográf alapú)
- területérintések (XLSX): belépés/kilépés timestamp geofence zónánként

## GPS koordináta string formátum (iFleet):
"H, Tatabánya[ÉÉNy]180 m, 1[ÉÉNy]79 m"
→ Ez egy szöveg mező, pontos string egyezéssel kell szűrni

## Üzleti logika:
- forduló = 1 teljes bányából COLAS-ra menet + visszaút
- érvénytelen visszatérés: bánya kilépés → következő belépés közt < 20 perc
- átlagos felrakodási idő: bent töltött idő a bányában, szűrve:
  < 20 perc = érvénytelen (nem valódi felrakodás)
  > 40 perc = outlier (kizárva)
- sebesség számítás: km különbség / idő különbség, odométer adatból
  kizárás ha: távolság > 35 km VAGY idő > 3 óra (outlier szűrés)

## Output: Excel fájl (openpyxl), sheet-enként bontva, fleet összesítővel

## Feladat:
[IDE ÍRD MIT SZERETNÉL – pl. "Számítsd ki a napi átlagos fordulók számát járművenkét"
vagy "Generálj hőtérképet a dwell time eloszlásról"]
```

---

## HASZNÁLATI TIPP

Minden prompt template **[IDE ÍRD MIT SZERETNÉL]** részét cseréld ki a konkrét
feladatra mielőtt beilleszted. A kontextus rész (stack, logika, konvenciók) marad.

A promptok egymásra is hivatkozhatnak: pl. ha az adatbázis promptot használtad
és utána FastAPI endpointot akarsz, hivatkozhatsz: "az előző schema alapján...".
