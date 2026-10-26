/* =========================================================
   MONEYMATE
   JAVASCRIPT
========================================================= */

/* Must be defined first: auth + sync code below uses it */
const $ = id => document.getElementById(id);


/* =========================================================
   CONFIGURATION
========================================================= */
/* =========================================================
   SUPABASE CONNECTION
========================================================= */
const SUPABASE_URL =
    "https://fwmlldtmvtxmywetwgve.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "YOUR_NEW_PUBLISHABLE_KEY";

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY
    );
    /* =========================================================
   SUPABASE AUTHENTICATION
========================================================= */

async function signUpUser(email, password) {

    const { data, error } =
        await supabaseClient.auth.signUp({
            email: email,
            password: password
        });

    if (error) {
        console.error("❌ Signup failed:", error);
        alert(error.message);
        return false;
    }

    console.log("✅ Signup successful:", data);

    alert(
        "Account created successfully. Please check your email to confirm your account."
    );

    return true;
}


async function loginUser(email, password) {

    const { data, error } =
        await supabaseClient.auth.signInWithPassword({
            email: email,
            password: password
        });

    if (error) {
        console.error("❌ Login failed:", error);
        alert(error.message);
        return false;
    }

    console.log("✅ Login successful:", data);

    return true;
}


async function logoutUser() {

    const { error } =
        await supabaseClient.auth.signOut();

    if (error) {
        console.error("❌ Logout failed:", error);
        alert(error.message);
        return false;
    }

    console.log("✅ Logged out successfully");

    return true;
}


/* =========================================================
   CHECK CURRENT USER
========================================================= */

async function getCurrentUser() {

    const {
        data: { user },
        error
    } = await supabaseClient.auth.getUser();

    if (error) {
        console.error("❌ Could not get current user:", error);
        return null;
    }

    return user;
}
/* =========================================================
   UPDATE AUTH BUTTON
========================================================= */

async function updateAuthUI(knownSession) {

    if (!authOpenBtn) return;

    let session = knownSession;

    if (session === undefined) {
        const { data } = await supabaseClient.auth.getSession();
        session = data ? data.session : null;
    }

    if (session && session.user) {

        authOpenBtn.textContent = "🚪 Logout";

        authOpenBtn.onclick = async () => {

            // Make sure everything is uploaded before we wipe this device
            await flushSync();

            if (isDirty() || isSettingsDirty()) {
                const leave = confirm(
                    "Some changes have not synced yet and will be lost if you log out. Log out anyway?"
                );
                if (!leave) return;
            }

            stopSync();

            const ok = await logoutUser();
            if (!ok) return;

            clearLocalData();
            renderAll();
            updateAuthUI(null);
        };

    } else {

        authOpenBtn.textContent = "🔐 Login";

        authOpenBtn.onclick = () => openAuthModal("login");
    }
}
/* =========================================================
   AUTH UI
========================================================= */

let authMode = "login";

const authModal = $("authModal");
const authForm = $("authForm");
const authTitle = $("authTitle");
const authSubmitBtn = $("authSubmitBtn");
const authToggleBtn = $("authToggleBtn");
const authCloseBtn = $("authCloseBtn");
const authOpenBtn = $("authOpenBtn");


function openAuthModal(mode = "login") {

    authMode = mode;

    authTitle.textContent =
        mode === "login"
            ? "Login"
            : "Create Account";

    authSubmitBtn.textContent =
        mode === "login"
            ? "Login"
            : "Create Account";

    authToggleBtn.textContent =
        mode === "login"
            ? "Create a new account"
            : "Already have an account? Login";

    authModal.classList.remove("hidden");
}


function closeAuthModal() {

    authModal.classList.add("hidden");

    authForm.reset();
}


if (authOpenBtn) {
    // click behaviour (login / logout) is set in updateAuthUI()
    authOpenBtn.onclick = () => openAuthModal("login");
}


if (authCloseBtn) {

    authCloseBtn.addEventListener(
        "click",
        closeAuthModal
    );
}


if (authToggleBtn) {

    authToggleBtn.addEventListener(
        "click",
        () => {

            openAuthModal(
                authMode === "login"
                    ? "signup"
                    : "login"
            );

        }
    );
}


if (authForm) {

    authForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();

            const email =
                $("authEmail").value.trim();

            const password =
                $("authPassword").value;

            if (authMode === "login") {

                const success =
                    await loginUser(
                        email,
                        password
                    );

                if (success) {
                    closeAuthModal();
                }

            } else {

                await signUpUser(
                    email,
                    password
                );

            }

        }
    );
}

/* =========================================================
   AUTH STATE LISTENER
   (never await Supabase calls directly inside this callback,
    so everything runs in a setTimeout)
========================================================= */

supabaseClient.auth.onAuthStateChange(
    (event, session) => {

        setTimeout(() => {

            updateAuthUI(session || null);

            if (session && session.user) {
                startSync(session.user);
            } else if (event === "SIGNED_OUT") {
                stopSync();
            }

        }, 0);
    }
);

/* =========================================================
   SUPABASE CONNECTION TEST
========================================================= */

async function testSupabaseConnection() {

    const { data, error } =
        await supabaseClient
            .from("transactions")
            .select("id")
            .limit(1);

    if (error) {

        console.error(
            "❌ Supabase connection failed:",
            error
        );

        return false;
    }

    console.log(
        "✅ MoneyMate connected to Supabase"
    );

    console.log(
        "Supabase response:",
        data
    );

    return true;
}


const CATEGORIES = [

    "🚗 Auto — Morning",
    "🍛 Lunch",
    "☕ Snacks",
    "🚗 Auto — Evening",
    "🍽️ Mess",
    "🍽️ Dinner",
    "📚 Study",
    "🏠 Home",
    "📱 Phone Recharge",
    "🏠 Home Rent",
    "🔐 Home Security",
    "💰 Money",
    "⚡ Electricity Bill",
    "🛒 Online Shopping",
    "🍔 Food Delivery",
    "🎬 Entertainment",
    "🎮 Gaming",
    "🧑‍⚕️ Health & Medicine",
    "💕 GF",
    "🤑 Fever",
    "👕 Clothing",
    "🎁 Gifts",
    "🐶 Pets",
    "✈️ Travel",
    "💪 Fitness",
    "💇 Personal Care",
    "🔄 Subscriptions",
    "🛒 Grocery",
    "💵 Cash",
    "📦 Other",
    "💼 Salary"
];


const STORAGE_KEY =
    "moneymate_transactions_v1";


const THEME_KEY =
    "moneymate_theme_v1";


let transactions =
    loadTransactions();


let editingId = null;


let currentType =
    "expense";


let toastTimer = null;


/* =========================================================
   CLOUD SYNC (Supabase)

   localStorage  = fast offline copy on each device
   Supabase      = the shared copy every device agrees on

   - Every save is uploaded a moment later (only what changed)
   - Other devices get updates live (realtime) and whenever
     you come back to the tab / app
   - Budgets, category budgets, goals and reminders sync too
========================================================= */

const OWNER_KEY = "moneymate_owner_v1";
const DIRTY_KEY = "moneymate_dirty_v1";
const SETTINGS_DIRTY_KEY = "moneymate_settings_dirty_v1";

let syncUser = null;          // logged-in user once sync is running
let pendingUser = null;       // user whose first sync failed (retry later)
let syncStarting = false;
let syncedSnapshot = new Map();   // id -> JSON of what the cloud has

let pushTimer = null;
let settingsPushTimer = null;
let pullTimer = null;

let pushing = false;
let pushingSettings = false;
let pushQueued = false;
let settingsQueued = false;

let changeCounter = 0;        // bumps on every local transaction change
let settingsCounter = 0;      // bumps on every local settings change

let realtimeChannel = null;


/* ---------- small helpers ---------- */

const isDirty = () => localStorage.getItem(DIRTY_KEY) === "1";
const isSettingsDirty = () => localStorage.getItem(SETTINGS_DIRTY_KEY) === "1";

function setSyncStatus(state) {

    const el = document.querySelector(".storage-status");
    if (!el) return;

    const labels = {
        local: "● Data saved locally",
        syncing: "↻ Syncing…",
        synced: "☁ Synced across devices",
        offline: "⚠ Offline — will sync later",
        error: "⚠ Sync failed — will retry"
    };

    el.textContent = labels[state] || labels.local;
}

function failState() {
    return navigator.onLine === false ? "offline" : "error";
}

function chunk(list, size) {

    const parts = [];

    for (let i = 0; i < list.length; i += size) {
        parts.push(list.slice(i, i + size));
    }

    return parts;
}

function stable(value) {

    return JSON.stringify(value, (key, val) => {

        if (val && typeof val === "object" && !Array.isArray(val)) {
            return Object.keys(val).sort().reduce((out, k) => {
                out[k] = val[k];
                return out;
            }, {});
        }

        return val;
    });
}

function snapshotOf(list) {
    return new Map(list.map(t => [t.id, JSON.stringify(t)]));
}

function writeLocalTransactions() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
}


/* ---------- row <-> transaction conversion ---------- */

function txToRow(t, userId) {

    return {
        id: String(t.id),
        display_id: String(t.displayId || t.id),
        user_id: userId,
        type: t.type,
        amount: Number(t.amount),
        name: t.name,
        category: t.category,
        date: new Date(t.date).toISOString(),
        payment_method: t.paymentMethod || null,
        note: t.note || null
    };
}

function rowToTx(r) {

    return {
        id: r.id,
        displayId: String(r.display_id || r.id),
        type: r.type,
        amount: Number(r.amount),
        name: r.name,
        category: r.category,
        date: new Date(r.date).toISOString(),
        paymentMethod: r.payment_method || "Other",
        note: r.note || ""
    };
}


/* ---------- settings (budgets, goals, reminders) ---------- */

function collectSettings() {

    const categoryBudgets = {};

    FINANCE_CATEGORIES.forEach(category => {
        const value = getCategoryBudget(category);
        if (value > 0) categoryBudgets[category] = value;
    });

    return {
        budget: Number(getStore("mmBudget", 0)) || 0,
        goals: getStore("mmGoals", []),
        reminders: getStore("mmReminders", []),
        categoryBudgets
    };
}

function hasLocalSettings() {

    const s = collectSettings();

    return (
        s.budget > 0 ||
        s.goals.length > 0 ||
        s.reminders.length > 0 ||
        Object.keys(s.categoryBudgets).length > 0
    );
}

// writes straight to localStorage (does NOT trigger an upload)
function applySettings(settings) {

    const s = settings || {};

    localStorage.setItem("mmBudget", JSON.stringify(Number(s.budget) || 0));
    localStorage.setItem("mmGoals", JSON.stringify(Array.isArray(s.goals) ? s.goals : []));
    localStorage.setItem("mmReminders", JSON.stringify(Array.isArray(s.reminders) ? s.reminders : []));

    const budgets = s.categoryBudgets || {};

    FINANCE_CATEGORIES.forEach(category => {

        const key = getCategoryBudgetKey(category);
        const value = Number(budgets[category]) || 0;

        if (value > 0) {
            localStorage.setItem(key, String(value));
        } else {
            localStorage.removeItem(key);
        }
    });
}


/* ---------- reading from the cloud ---------- */

// Supabase returns max 1000 rows per request, so read in pages
async function fetchAllTransactions() {

    const all = [];
    const size = 1000;

    for (let from = 0; ; from += size) {

        const { data, error } = await supabaseClient
            .from("transactions")
            .select("*")
            .order("id", { ascending: true })
            .range(from, from + size - 1);

        if (error) throw error;

        all.push(...data);

        if (data.length < size) break;
    }

    return all;
}

async function fetchSettings(userId) {

    const { data, error } = await supabaseClient
        .from("user_settings")
        .select("data")
        .eq("user_id", userId)
        .maybeSingle();

    if (error) throw error;

    return data ? data.data : null;
}


/* ---------- called whenever something changes locally ---------- */

function onLocalTransactionsSaved() {

    changeCounter++;

    localStorage.setItem(DIRTY_KEY, "1");

    if (!syncUser) return;

    setSyncStatus("syncing");

    clearTimeout(pushTimer);
    pushTimer = setTimeout(pushTransactions, 500);
}

function onLocalSettingsSaved() {

    settingsCounter++;

    localStorage.setItem(SETTINGS_DIRTY_KEY, "1");

    if (!syncUser) return;

    setSyncStatus("syncing");

    clearTimeout(settingsPushTimer);
    settingsPushTimer = setTimeout(pushSettings, 700);
}


/* ---------- uploading ---------- */

async function pushTransactions() {

    if (!syncUser) return true;

    if (pushing) {
        pushQueued = true;
        return false;
    }

    pushing = true;

    const user = syncUser;
    const startCounter = changeCounter;

    let ok = true;

    try {

        const current = snapshotOf(transactions);

        const changed = transactions.filter(
            t => syncedSnapshot.get(t.id) !== current.get(t.id)
        );

        const removed = [...syncedSnapshot.keys()].filter(
            id => !current.has(id)
        );

        for (const part of chunk(changed, 500)) {

            const { error } = await supabaseClient
                .from("transactions")
                .upsert(
                    part.map(t => txToRow(t, user.id)),
                    { onConflict: "user_id,id" }
                );

            if (error) throw error;
        }

        for (const part of chunk(removed, 200)) {

            const { error } = await supabaseClient
                .from("transactions")
                .delete()
                .eq("user_id", user.id)
                .in("id", part);

            if (error) throw error;
        }

        syncedSnapshot = current;

        // only clear the flag if nothing new was changed while uploading
        if (startCounter === changeCounter) {
            localStorage.removeItem(DIRTY_KEY);
        }

        setSyncStatus("synced");

    } catch (error) {

        ok = false;
        console.error("❌ Upload failed:", error);
        setSyncStatus(failState());
    }

    pushing = false;

    if (pushQueued) {
        pushQueued = false;
        return pushTransactions();
    }

    return ok;
}

async function pushSettings() {

    if (!syncUser) return true;

    if (pushingSettings) {
        settingsQueued = true;
        return false;
    }

    pushingSettings = true;

    const user = syncUser;
    const startCounter = settingsCounter;

    let ok = true;

    try {

        const { error } = await supabaseClient
            .from("user_settings")
            .upsert(
                {
                    user_id: user.id,
                    data: collectSettings(),
                    updated_at: new Date().toISOString()
                },
                { onConflict: "user_id" }
            );

        if (error) throw error;

        if (startCounter === settingsCounter) {
            localStorage.removeItem(SETTINGS_DIRTY_KEY);
        }

        setSyncStatus("synced");

    } catch (error) {

        ok = false;
        console.error("❌ Settings upload failed:", error);
        setSyncStatus(failState());
    }

    pushingSettings = false;

    if (settingsQueued) {
        settingsQueued = false;
        return pushSettings();
    }

    return ok;
}

async function flushSync() {

    clearTimeout(pushTimer);
    clearTimeout(settingsPushTimer);

    if (isDirty()) await pushTransactions();
    if (isSettingsDirty()) await pushSettings();
}


/* ---------- downloading changes made on another device ---------- */

function schedulePull() {

    clearTimeout(pullTimer);
    pullTimer = setTimeout(pullFromCloud, 600);
}

async function pullFromCloud() {

    // never overwrite changes that have not been uploaded yet
    if (!syncUser || pushing || pushingSettings) return;
    if (isDirty() || isSettingsDirty()) return;

    try {

        const rows = (await fetchAllTransactions()).map(rowToTx);
        const cloudSettings = await fetchSettings(syncUser.id);

        // user changed something while we were downloading
        if (isDirty() || isSettingsDirty()) return;

        const sortById = list =>
            [...list].sort((a, b) => String(a.id).localeCompare(String(b.id)));

        const txChanged =
            stable(sortById(rows)) !== stable(sortById(transactions));

        const settingsChanged =
            stable(cloudSettings || {}) !== stable(collectSettings());

        if (!txChanged && !settingsChanged) {
            setSyncStatus("synced");
            return;
        }

        if (txChanged) {
            transactions = rows;
            syncedSnapshot = snapshotOf(rows);
            writeLocalTransactions();
        }

        if (settingsChanged && cloudSettings) {
            applySettings(cloudSettings);
        }

        renderAll();
        setSyncStatus("synced");

    } catch (error) {

        console.error("❌ Download failed:", error);
        setSyncStatus(failState());
    }
}

function startRealtime() {

    stopRealtime();

    try {

        realtimeChannel = supabaseClient
            .channel("moneymate-" + syncUser.id)
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "transactions" },
                schedulePull
            )
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "user_settings" },
                schedulePull
            )
            .subscribe();

    } catch (error) {

        console.warn("Realtime not available, using refresh-on-focus only.", error);
    }
}

function stopRealtime() {

    if (realtimeChannel) {
        try { supabaseClient.removeChannel(realtimeChannel); } catch {}
        realtimeChannel = null;
    }
}


/* ---------- start / stop ---------- */

async function startSync(user) {

    if (syncUser && syncUser.id === user.id) return;
    if (syncStarting) return;

    syncStarting = true;
    setSyncStatus("syncing");

    try {

        const owner = localStorage.getItem(OWNER_KEY);
        const sameAccount = owner === user.id;
        const otherAccount = Boolean(owner) && !sameAccount;

        const cloudTx = (await fetchAllTransactions()).map(rowToTx);
        const cloudSettings = await fetchSettings(user.id);

        /*
           Decide what this device shows:

           - cache belongs to ANOTHER account  -> throw it away, use cloud
           - same account, nothing pending      -> use cloud
           - same account, unsynced changes     -> keep local changes, upload them
           - data made before logging in (guest) -> merge with cloud, upload extras
        */

        let merged;

        if (otherAccount || (sameAccount && !isDirty())) {

            merged = cloudTx;

        } else {

            const map = new Map(cloudTx.map(t => [t.id, t]));

            transactions.forEach(t => {
                if (sameAccount || !map.has(t.id)) map.set(t.id, t);
            });

            merged = [...map.values()];
        }

        transactions = merged;
        syncedSnapshot = snapshotOf(cloudTx);

        localStorage.setItem(OWNER_KEY, user.id);
        writeLocalTransactions();

        let uploadSettings = false;

        if (otherAccount) {
            applySettings(cloudSettings || {});
        } else if (sameAccount && isSettingsDirty()) {
            uploadSettings = true;
        } else if (cloudSettings) {
            applySettings(cloudSettings);
        } else if (hasLocalSettings()) {
            uploadSettings = true;
        }

        syncUser = user;
        pendingUser = null;

        renderAll();

        await pushTransactions();

        if (uploadSettings) await pushSettings();

        startRealtime();

    } catch (error) {

        console.error("❌ First sync failed:", error);

        pendingUser = user;
        syncUser = null;

        setSyncStatus(failState());

    } finally {

        syncStarting = false;
    }
}

function stopSync() {

    clearTimeout(pushTimer);
    clearTimeout(settingsPushTimer);
    clearTimeout(pullTimer);

    stopRealtime();

    syncUser = null;
    pendingUser = null;
    syncedSnapshot = new Map();

    setSyncStatus("local");
}

// used on logout so the next person/account never sees this data
function clearLocalData() {

    transactions = [];

    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(OWNER_KEY);
    localStorage.removeItem(DIRTY_KEY);
    localStorage.removeItem(SETTINGS_DIRTY_KEY);
    localStorage.removeItem("mmBudget");
    localStorage.removeItem("mmGoals");
    localStorage.removeItem("mmReminders");

    FINANCE_CATEGORIES.forEach(category => {
        localStorage.removeItem(getCategoryBudgetKey(category));
    });
}


/* ---------- come back online / return to the app ---------- */

document.addEventListener("visibilitychange", () => {

    if (document.visibilityState !== "visible") return;

    if (syncUser) {
        schedulePull();
    } else if (pendingUser) {
        startSync(pendingUser);
    }
});

window.addEventListener("online", async () => {

    if (syncUser) {

        await flushSync();
        schedulePull();

    } else if (pendingUser) {

        startSync(pendingUser);
    }
});

window.addEventListener("offline", () => {

    if (syncUser) setSyncStatus("offline");
});



/* =========================================================
   HELPERS
========================================================= */



function money(value) {

    return new Intl.NumberFormat(
        "en-IN",
        {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 2
        }
    ).format(Number(value) || 0);

}


function escapeHTML(value) {

    return String(value ?? "")
        .replace(
            /[&<>"']/g,
            character => {

                const map = {

                    "&": "&amp;",
                    "<": "&lt;",
                    ">": "&gt;",
                    '"': "&quot;",
                    "'": "&#039;"

                };

                return map[character];

            }
        );

}


function createId() {

    if (
        window.crypto &&
        crypto.randomUUID
    ) {

        return crypto.randomUUID();

    }

    return (
        Date.now().toString(36) +
        Math.random()
            .toString(36)
            .slice(2)
    );

}


function localDateTime(date) {

    const adjusted =
        new Date(
            date.getTime() -
            date.getTimezoneOffset() * 60000
        );

    return adjusted
        .toISOString()
        .slice(0, 16);

}


function formatDate(value) {

    return new Date(value)
        .toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );

}


function formatShortDate(value) {

    return new Date(value)
        .toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short"
            }
        );

}


function showToast(message) {

    const toast =
        $("toast");

    toast.textContent =
        message;

    toast.classList.add("show");

    clearTimeout(
        toastTimer
    );

    toastTimer =
        setTimeout(
            () => {

                toast.classList.remove(
                    "show"
                );

            },
            2400
        );

}


/* =========================================================
   LOCAL STORAGE
========================================================= */

function loadTransactions() {

    try {

        const saved =
            localStorage.getItem(
                STORAGE_KEY
            );

        const data =
            JSON.parse(
                saved || "[]"
            );

        return Array.isArray(data)
            ? data
            : [];

    }

    catch {

        return [];

    }

}


function saveTransactions() {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(
            transactions
        )
    );

    onLocalTransactionsSaved();

}


/* =========================================================
   CATEGORY SETUP
========================================================= */

function populateCategories() {

    $("category").innerHTML =
        CATEGORIES
            .map(
                category => `
                    <option value="${escapeHTML(category)}">
                        ${escapeHTML(category)}
                    </option>
                `
            )
            .join("");


    $("categoryFilter").innerHTML =
        `
        <option value="all">
            All Categories
        </option>
        ` +

        CATEGORIES
            .map(
                category => `
                    <option value="${escapeHTML(category)}">
                        ${escapeHTML(category)}
                    </option>
                `
            )
            .join("");

}


/* =========================================================
   TRANSACTION TYPE
========================================================= */

function setType(type) {

    currentType =
        type;


    $("expenseTypeBtn")
        .classList
        .toggle(
            "active",
            type === "expense"
        );


    $("incomeTypeBtn")
        .classList
        .toggle(
            "active",
            type === "income"
        );


    $("category").disabled =
        type === "income";


    if (type === "income") {

        $("category").value =
            "💼 Salary";

    }

}


/* =========================================================
   MODAL
========================================================= */

function openModal(id = null) {

    editingId =
        id;


    $("modalTitle").textContent =
        id
            ? "Edit Transaction"
            : "Add Transaction";


    if (id) {

        const transaction =
            transactions.find(
                item =>
                    item.id === id
            );


        if (!transaction)
            return;


        setType(
            transaction.type
        );


        $("amount").value =
            transaction.amount;


        $("transactionName").value =
            transaction.name;


        $("category").value =
            transaction.category;


        $("dateTime").value =
            localDateTime(
                new Date(
                    transaction.date
                )
            );


        $("paymentMethod").value =
            transaction.paymentMethod ||
            "Other";


        $("note").value =
            transaction.note || "";

    }

    else {

        $("transactionForm")
            .reset();


        setType(
            "expense"
        );


        $("dateTime").value =
            localDateTime(
                new Date()
            );


        $("paymentMethod").value =
            "UPI";

    }


    $("transactionModal")
        .classList
        .remove("hidden");


    setTimeout(
        () =>
            $("amount").focus(),
        50
    );

}


function closeModal() {

    $("transactionModal")
        .classList
        .add("hidden");


    editingId =
        null;

}


/* =========================================================
   MODAL EVENTS
========================================================= */

$("openAddBtn")
    .addEventListener(
        "click",
        () =>
            openModal()
    );


$("expenseTypeBtn")
    .addEventListener(
        "click",
        () =>
            setType("expense")
    );


$("incomeTypeBtn")
    .addEventListener(
        "click",
        () =>
            setType("income")
    );


document
    .querySelectorAll(
        "[data-close-modal]"
    )
    .forEach(
        element => {

            element.addEventListener(
                "click",
                closeModal
            );

        }
    );


/* =========================================================
   ADD / EDIT TRANSACTION
========================================================= */

$("transactionForm")
    .addEventListener(
        "submit",
        event => {

            event.preventDefault();


            const amount =
                Number(
                    $("amount").value
                );


            if (
                !amount ||
                amount <= 0
            ) {

                showToast(
                    "Please enter a valid amount."
                );

                return;

            }


            const name =
                $("transactionName")
                    .value
                    .trim();


            if (!name) {

                showToast(
                    "Please enter a transaction name."
                );

                return;

            }


            const transaction = {

                id:
                    editingId ||
                    createId(),

                type:
                    currentType,

                amount:
                    amount,

                name:
                    name,

                category:
                    currentType === "income"
                        ? "📦 Other"
                        : $("category").value,

                date:
                    new Date(
                        $("dateTime").value
                    ).toISOString(),

                paymentMethod:
                    $("paymentMethod").value,

                note:
                    $("note").value.trim()

            };


            const wasEditing =
                Boolean(
                    editingId
                );


            if (wasEditing) {

                transactions =
                    transactions.map(
                        item =>
                            item.id === editingId
                                ? transaction
                                : item
                    );

            }

            else {

                transactions.push(
                    transaction
                );

            }


            saveTransactions();


            closeModal();


            renderAll();


            showToast(
                wasEditing
                    ? "Transaction updated."
                    : "Transaction saved."
            );

        }
    );


/* =========================================================
   TOTALS
========================================================= */

function calculateTotals() {

    const income =
        transactions
            .filter(
                transaction =>
                    transaction.type ===
                    "income"
            )
            .reduce(
                (total, transaction) =>
                    total +
                    Number(
                        transaction.amount
                    ),
                0
            );


    const expenses =
        transactions
            .filter(
                transaction =>
                    transaction.type ===
                    "expense"
            )
            .reduce(
                (total, transaction) =>
                    total +
                    Number(
                        transaction.amount
                    ),
                0
            );


    return {

        income,

        expenses,

        balance:
            income -
            expenses

    };

}


/* =========================================================
   MONTHLY EXPENSE
========================================================= */

function getCurrentMonthExpense() {

    const now =
        new Date();


    const year =
        now.getFullYear();


    const month =
        now.getMonth();


    return transactions

        .filter(
            transaction =>
                transaction.type ===
                "expense"
        )

        .filter(
            transaction => {

                const date =
                    new Date(
                        transaction.date
                    );

                return (
                    date.getFullYear() ===
                        year &&

                    date.getMonth() ===
                        month
                );

            }
        )

        .reduce(
            (total, transaction) =>
                total +
                Number(
                    transaction.amount
                ),
            0
        );

}


/* =========================================================
   TODAY'S EXPENSE
========================================================= */

function getTodayExpense() {

    const today =
        new Date()
            .toDateString();


    return transactions

        .filter(
            transaction =>
                transaction.type ===
                "expense"
        )

        .filter(
            transaction =>
                new Date(
                    transaction.date
                ).toDateString() ===
                today
        )

        .reduce(
            (total, transaction) =>
                total +
                Number(
                    transaction.amount
                ),
            0
        );

}


/* =========================================================
   SUMMARY
========================================================= */

function renderSummary() {

    const totals =
        calculateTotals();


    $("totalBalance")
        .textContent =
        money(
            totals.balance
        );


    $("totalIncome")
        .textContent =
        money(
            totals.income
        );


    $("totalExpenses")
        .textContent =
        money(
            totals.expenses
        );


    $("monthExpenses")
        .textContent =
        money(
            getCurrentMonthExpense()
        );


    $("monthChange")
        .textContent =
        `Today: ${money(
            getTodayExpense()
        )}`;

}


/* =========================================================
   TRANSACTION HTML
========================================================= */

function transactionHTML(
    transaction
) {

    const sign =
        transaction.type ===
        "expense"
            ? "−"
            : "+";


    return `

        <div class="transaction-row">

            <div
                class="tx-icon
                ${
                    transaction.type ===
                    "income"
                        ? "income"
                        : ""
                }"
            >
                ${
                    transaction.type ===
                    "income"
                        ? "↗"
                        : "↘"
                }
            </div>


            <div>

                <div class="tx-name">
                    ${escapeHTML(
                        transaction.name
                    )}
                </div>

                <div class="tx-meta">

                    ${escapeHTML(
                        transaction.category
                    )}

                    ·

                    ${escapeHTML(
                        transaction.paymentMethod ||
                        "Other"
                    )}

                    ${
                        transaction.note
                            ? `
                                ·
                                ${escapeHTML(
                                    transaction.note
                                )}
                              `
                            : ""
                    }

                </div>

            </div>


            <div class="tx-date">

                ${formatShortDate(
                    transaction.date
                )}

            </div>


            <div class="tx-method">

                ${escapeHTML(
                    transaction.paymentMethod ||
                    ""
                )}

            </div>


            <div
                class="tx-amount
                ${transaction.type}"
            >

                ${sign}${money(
                    transaction.amount
                )}

            </div>


            <div class="tx-actions">

                <button
                    class="icon-button"
                    title="Edit"
                    onclick="openModal('${transaction.id}')"
                >
                    ✎
                </button>


                <button
                    class="icon-button"
                    title="Delete"
                    onclick="deleteTransaction('${transaction.id}')"
                >
                    ×
                </button>

            </div>

        </div>

    `;

}


/* =========================================================
   RECENT TRANSACTIONS
========================================================= */

function renderRecentTransactions() {

    const list =
        [...transactions]

            .sort(
                (a, b) =>
                    new Date(b.date) -
                    new Date(a.date)
            )

            .slice(0, 7);


    if (!list.length) {

        $("recentTransactions")
            .innerHTML = `

                <div class="empty">

                    <strong>
                        No transactions yet
                    </strong>

                    Add your first income or
                    expense to start tracking.

                </div>

            `;

        return;

    }


    $("recentTransactions")
        .innerHTML =
        list
            .map(
                transaction =>
                    transactionHTML(
                        transaction
                    )
            )
            .join("");

}


/* =========================================================
   TRANSACTION HISTORY
========================================================= */

function renderHistory() {

    const search =
        ($("searchInput")?.value || "")
            .trim()
            .toLowerCase();

    const type =
        $("typeFilter")?.value || "all";

    const category =
        $("categoryFilter")?.value || "all";

    const month =
        $("monthFilter")?.value || "";

    const year =
        $("yearFilter")?.value || "all";

    const min =
        Number($("minAmountFilter")?.value || 0);

    const maxRaw =
        $("maxAmountFilter")?.value || "";

    const max =
        maxRaw === ""
            ? Infinity
            : Number(maxRaw);

    const method =
        $("paymentMethodFilter")?.value || "all";

    const from =
        $("fromDateFilter")?.value || "";

    const to =
        $("toDateFilter")?.value || "";

    const sort =
        $("sortFilter")?.value || "date-desc";

    let list = transactions.filter(transaction => {

        const searchable = `
            ${transaction.name || ""}
            ${transaction.category || ""}
            ${transaction.paymentMethod || ""}
            ${transaction.note || ""}
        `.toLowerCase();

        const date =
            (transaction.date || "").slice(0, 10);

        const transactionMonth =
            date.slice(0, 7);

        const transactionYear =
            date.slice(0, 4);

        const matchesSearch =
            !search ||
            searchable.includes(search);

        const matchesType =
            type === "all" ||
            transaction.type === type;

        const matchesCategory =
            category === "all" ||
            transaction.category === category;

        const matchesMonth =
            !month ||
            transactionMonth === month;

        const matchesYear =
            year === "all" ||
            transactionYear === year;

        const amount =
            Number(transaction.amount) || 0;

        const matchesAmount =
            amount >= min &&
            amount <= max;

        const storedMethod =
            String(transaction.paymentMethod || "").trim();

        const matchesMethod =
            method === "all" ||
            storedMethod === method;

        const matchesFrom =
            !from || date >= from;

        const matchesTo =
            !to || date <= to;

        return (
            matchesSearch &&
            matchesType &&
            matchesCategory &&
            matchesMonth &&
            matchesYear &&
            matchesAmount &&
            matchesMethod &&
            matchesFrom &&
            matchesTo
        );

    });

    list.sort((a, b) => {

        switch (sort) {

            case "date-asc":
                return new Date(a.date) - new Date(b.date);

            case "amount-desc":
                return Number(b.amount) - Number(a.amount);

            case "amount-asc":
                return Number(a.amount) - Number(b.amount);

            case "name-asc":
                return String(a.name || "")
                    .localeCompare(String(b.name || ""));

            default:
                return new Date(b.date) - new Date(a.date);

        }

    });

    if (!$("historyTransactions")) return;

    $("historyTransactions").innerHTML =
        list.length
            ? list.map(transactionHTML).join("")
            : `
                <div class="empty">
                    <strong>No matching transactions</strong>
                    Try changing your filters.
                </div>
            `;

}


/* =========================================================
   DELETE TRANSACTION
========================================================= */

function deleteTransaction(id) {

    const transaction =
        transactions.find(
            item =>
                item.id === id
        );


    if (!transaction)
        return;


    const confirmed =
        confirm(
            `Delete "${transaction.name}" (${money(
                transaction.amount
            )})?`
        );


    if (!confirmed)
        return;


    transactions =
        transactions.filter(
            item =>
                item.id !== id
        );


    saveTransactions();


    renderAll();


    showToast(
        "Transaction deleted."
    );

}


/* =========================================================
   CATEGORY TOTALS
========================================================= */

function getCategoryTotals() {

    const totals = {};


    transactions

        .filter(
            transaction =>
                transaction.type ===
                "expense"
        )

        .forEach(
            transaction => {

                const category =
                    transaction.category;


                totals[category] =
                    (
                        totals[category] ||
                        0
                    ) +
                    Number(
                        transaction.amount
                    );

            }
        );


    return Object.entries(
        totals
    )
        .sort(
            (a, b) =>
                b[1] -
                a[1]
        );

}


/* =========================================================
   CATEGORY BREAKDOWN
========================================================= */

function renderCategoryBreakdown() {

    const rows =
        getCategoryTotals();


    const total =
        rows.reduce(
            (sum, row) =>
                sum + row[1],
            0
        );


    if (!rows.length) {

        $("categoryBreakdown")
            .innerHTML = `

                <div class="empty">

                    No expense data yet.

                </div>

            `;

        return;

    }


    $("categoryBreakdown")
        .innerHTML =

        rows.map(
            ([category, amount]) => {

                const percentage =
                    total
                        ? (
                            amount /
                            total
                        ) * 100
                        : 0;


                return `

                    <div class="category-row clickable-category" onclick="openCategoryTransactions('${escapeHTML(category)}')">

                        <div class="category-icon">

                            ${category
                                .split(" ")[0]}

                        </div>


                        <div class="category-info">

                            <strong>
                                ${escapeHTML(
                                    category
                                )}
                            </strong>

                            <div
                                class="category-progress"
                            >

                                <span
                                    style="
                                        width:
                                        ${percentage}%
                                    "
                                ></span>

                            </div>

                        </div>


                        <b>
                            ${money(amount)}
                        </b>

                    </div>

                `;

            }
        ).join("");

}


/* =========================================================
   DAILY DATA
========================================================= */

function getDailyData(days = 7) {

    const result = [];


    const now =
        new Date();


    for (
        let i = days - 1;
        i >= 0;
        i--
    ) {

        const date =
            new Date(now);


        date.setHours(
            0,
            0,
            0,
            0
        );


        date.setDate(
            date.getDate() - i
        );


        const next =
            new Date(date);


        next.setDate(
            next.getDate() + 1
        );


        const value =
            transactions

                .filter(
                    transaction =>
                        transaction.type ===
                        "expense"
                )

                .filter(
                    transaction => {

                        const transactionDate =
                            new Date(
                                transaction.date
                            );


                        return (
                            transactionDate >=
                                date &&
                            transactionDate <
                                next
                        );

                    }
                )

                .reduce(
                    (sum, transaction) =>
                        sum +
                        Number(
                            transaction.amount
                        ),
                    0
                );


        result.push({

            label:
                date.toLocaleDateString(
                    "en-IN",
                    {
                        weekday: "short"
                    }
                ),

            value

        });

    }


    return result;

}


/* =========================================================
   MONTHLY DATA
========================================================= */

function getMonthlyData() {

    const result = [];


    const now =
        new Date();


    for (
        let i = 5;
        i >= 0;
        i--
    ) {

        const start =
            new Date(
                now.getFullYear(),
                now.getMonth() - i,
                1
            );


        const end =
            new Date(
                now.getFullYear(),
                now.getMonth() - i + 1,
                1
            );


        const value =
            transactions

                .filter(
                    transaction =>
                        transaction.type ===
                        "expense"
                )

                .filter(
                    transaction => {

                        const date =
                            new Date(
                                transaction.date
                            );


                        return (
                            date >= start &&
                            date < end
                        );

                    }
                )

                .reduce(
                    (sum, transaction) =>
                        sum +
                        Number(
                            transaction.amount
                        ),
                    0
                );


        result.push({

            label:
                start.toLocaleDateString(
                    "en-IN",
                    {
                        month: "short"
                    }
                ),

            value

        });

    }


    return result;

}


/* =========================================================
   CANVAS SETUP
========================================================= */

function setupCanvas(canvas) {

    const rect =
        canvas.getBoundingClientRect();


    const dpr =
        window.devicePixelRatio ||
        1;


    canvas.width =
        rect.width * dpr;


    canvas.height =
        rect.height * dpr;


    const context =
        canvas.getContext("2d");


    context.setTransform(
        dpr,
        0,
        0,
        dpr,
        0,
        0
    );


    return {

        ctx: context,

        width: rect.width,

        height: rect.height

    };

}


/* =========================================================
   COMPACT MONEY
========================================================= */

function compactMoney(value) {

    if (value >= 10000000) {

        return (
            "₹" +
            (
                value /
                10000000
            ).toFixed(1) +
            "Cr"
        );

    }


    if (value >= 100000) {

        return (
            "₹" +
            (
                value /
                100000
            ).toFixed(1) +
            "L"
        );

    }


    if (value >= 1000) {

        return (
            "₹" +
            (
                value /
                1000
            ).toFixed(1) +
            "K"
        );

    }


    return (
        "₹" +
        Math.round(value)
    );

}


/* =========================================================
   BAR CHART
========================================================= */

function drawBarChart(
    canvas,
    data
) {

    if (!canvas)
        return;


    const {

        ctx,
        width,
        height

    } =
        setupCanvas(canvas);


    ctx.clearRect(
        0,
        0,
        width,
        height
    );


    const max =
        Math.max(
            ...data.map(
                item =>
                    item.value
            ),
            1
        );


    const padding = {

        left: 42,

        right: 15,

        top: 20,

        bottom: 35

    };


    const innerWidth =
        width -
        padding.left -
        padding.right;


    const innerHeight =
        height -
        padding.top -
        padding.bottom;


    const styles =
        getComputedStyle(
            document.body
        );


    const border =
        styles.getPropertyValue(
            "--border"
        );


    const primary =
        styles.getPropertyValue(
            "--primary"
        );


    const muted =
        styles.getPropertyValue(
            "--muted"
        );


    const text =
        styles.getPropertyValue(
            "--text"
        );


    /* GRID */

    ctx.strokeStyle =
        border;


    ctx.lineWidth = 1;


    for (
        let i = 0;
        i < 4;
        i++
    ) {

        const y =
            padding.top +
            (
                innerHeight *
                i /
                3
            );


        ctx.beginPath();

        ctx.moveTo(
            padding.left,
            y
        );

        ctx.lineTo(
            width -
            padding.right,
            y
        );

        ctx.stroke();

    }


    /* BARS */

    const gap =
        Math.min(
            24,
            innerWidth /
                data.length *
                0.18
        );


    const barWidth =
        (
            innerWidth -
            gap *
            (data.length + 1)
        ) /
        data.length;


    data.forEach(
        (item, index) => {

            const barHeight =
                (
                    item.value /
                    max
                ) *
                innerHeight;


            const x =
                padding.left +
                gap +
                index *
                (
                    barWidth +
                    gap
                );


            const y =
                padding.top +
                innerHeight -
                barHeight;


            ctx.fillStyle =
                primary;


            ctx.beginPath();


            if (
                typeof ctx.roundRect ===
                "function"
            ) {

                ctx.roundRect(
                    x,
                    y,
                    barWidth,
                    barHeight,
                    7
                );

            }

            else {

                ctx.rect(
                    x,
                    y,
                    barWidth,
                    barHeight
                );

            }


            ctx.fill();


            /* LABEL */

            ctx.fillStyle =
                muted;


            ctx.font =
                "11px system-ui";


            ctx.textAlign =
                "center";


            ctx.fillText(
                item.label,
                x +
                    barWidth /
                    2,
                height -
                    12
            );


            /* VALUE */

            if (
                item.value > 0
            ) {

                ctx.fillStyle =
                    text;


                ctx.font =
                    "10px system-ui";


                ctx.fillText(
                    compactMoney(
                        item.value
                    ),
                    x +
                        barWidth /
                        2,
                    Math.max(
                        y - 7,
                        12
                    )
                );

            }

        }
    );

}
/* =========================================================
   LINE CHART
   Monthly spending trend
========================================================= */

function drawLineChart(canvas, data) {

    if (!canvas) return;

    const {
        ctx,
        width,
        height
    } = setupCanvas(canvas);

    ctx.clearRect(
        0,
        0,
        width,
        height
    );

    if (!data || !data.length) {

        const styles =
            getComputedStyle(document.body);

        ctx.fillStyle =
            styles.getPropertyValue("--muted");

        ctx.font =
            "14px system-ui";

        ctx.textAlign =
            "center";

        ctx.fillText(
            "No expense data yet",
            width / 2,
            height / 2
        );

        return;
    }

    const styles =
        getComputedStyle(document.body);

    const border =
        styles.getPropertyValue("--border");

    const primary =
        styles.getPropertyValue("--primary");

    const muted =
        styles.getPropertyValue("--muted");

    const text =
        styles.getPropertyValue("--text");

    const background =
        styles.getPropertyValue("--background");


    /* =====================================================
       PADDING
    ===================================================== */

    const padding = {
        left: 55,
        right: 30,
        top: 25,
        bottom: 45
    };


    const chartWidth =
        width -
        padding.left -
        padding.right;

    const chartHeight =
        height -
        padding.top -
        padding.bottom;


    /* =====================================================
       MAX VALUE
    ===================================================== */

    const maxValue =
        Math.max(
            ...data.map(
                item =>
                    Number(item.value) || 0
            ),
            1
        );


    /*
       Give the graph a little breathing room above
       the highest point.
    */

    const graphMax =
        maxValue * 1.15;


    /* =====================================================
       GRID LINES
    ===================================================== */

    ctx.lineWidth = 1;

    ctx.strokeStyle =
        border;

    for (
        let i = 0;
        i <= 4;
        i++
    ) {

        const y =
            padding.top +
            (
                chartHeight *
                i /
                4
            );

        ctx.beginPath();

        ctx.moveTo(
            padding.left,
            y
        );

        ctx.lineTo(
            width -
            padding.right,
            y
        );

        ctx.stroke();


        /* Y AXIS VALUE */

        const value =
            graphMax -
            (
                graphMax *
                i /
                4
            );

        ctx.fillStyle =
            muted;

        ctx.font =
            "11px system-ui";

        ctx.textAlign =
            "right";

        ctx.fillText(
            compactMoney(value),
            padding.left - 10,
            y + 4
        );

    }


    /* =====================================================
       POINT POSITIONS
    ===================================================== */

    const points =
        data.map(
            (item, index) => {

                const value =
                    Number(item.value) || 0;

                const x =
                    data.length === 1
                        ? padding.left +
                          chartWidth / 2
                        : padding.left +
                          (
                              chartWidth *
                              index /
                              (data.length - 1)
                          );

                const y =
                    padding.top +
                    chartHeight -
                    (
                        value /
                        graphMax
                    ) *
                    chartHeight;

                return {
                    x,
                    y,
                    value,
                    label:
                        item.label
                };

            }
        );


    /* =====================================================
       AREA UNDER LINE
    ===================================================== */

    const areaGradient =
        ctx.createLinearGradient(
            0,
            padding.top,
            0,
            padding.top +
            chartHeight
        );

    areaGradient.addColorStop(
        0,
        "rgba(124, 116, 255, 0.22)"
    );

    areaGradient.addColorStop(
        1,
        "rgba(124, 116, 255, 0)"
    );


    ctx.beginPath();

    points.forEach(
        (point, index) => {

            if (index === 0) {

                ctx.moveTo(
                    point.x,
                    point.y
                );

            } else {

                ctx.lineTo(
                    point.x,
                    point.y
                );

            }

        }
    );


    ctx.lineTo(
        points[points.length - 1].x,
        padding.top +
        chartHeight
    );

    ctx.lineTo(
        points[0].x,
        padding.top +
        chartHeight
    );

    ctx.closePath();

    ctx.fillStyle =
        areaGradient;

    ctx.fill();


    /* =====================================================
       LINE
    ===================================================== */

    ctx.beginPath();

    points.forEach(
        (point, index) => {

            if (index === 0) {

                ctx.moveTo(
                    point.x,
                    point.y
                );

            } else {

                /*
                   Smooth-looking curve using
                   quadratic interpolation.
                */

                const previous =
                    points[index - 1];

                const middleX =
                    (
                        previous.x +
                        point.x
                    ) / 2;

                ctx.quadraticCurveTo(
                    previous.x,
                    previous.y,
                    middleX,
                    (
                        previous.y +
                        point.y
                    ) / 2
                );

                ctx.quadraticCurveTo(
                    middleX,
                    (
                        previous.y +
                        point.y
                    ) / 2,
                    point.x,
                    point.y
                );

            }

        }
    );

    ctx.strokeStyle =
        primary;

    ctx.lineWidth = 3;

    ctx.lineJoin =
        "round";

    ctx.lineCap =
        "round";

    ctx.stroke();


    /* =====================================================
       X AXIS LABELS + POINTS
    ===================================================== */

    points.forEach(
        point => {

            /* POINT */

            ctx.beginPath();

            ctx.arc(
                point.x,
                point.y,
                5,
                0,
                Math.PI * 2
            );

            ctx.fillStyle =
                background;

            ctx.fill();

            ctx.strokeStyle =
                primary;

            ctx.lineWidth = 3;

            ctx.stroke();


            /* MONTH LABEL */

            ctx.fillStyle =
                text;

            ctx.font =
                "12px system-ui";

            ctx.textAlign =
                "center";

            ctx.fillText(
                point.label,
                point.x,
                padding.top +
                chartHeight +
                25
            );


            /* VALUE */

            if (point.value > 0) {

                ctx.fillStyle =
                    text;

                ctx.font =
                    "11px system-ui";

                ctx.fillText(
                    compactMoney(
                        point.value
                    ),
                    point.x,
                    point.y - 12
                );

            }

        }
    );

}


/* =========================================================
   CATEGORY CHART
========================================================= */

function drawCategoryChart(
    canvas
) {

    if (!canvas)
        return;


    const rows =
        getCategoryTotals()
            .slice(0, 8);


    const {

        ctx,
        width,
        height

    } =
        setupCanvas(canvas);


    ctx.clearRect(
        0,
        0,
        width,
        height
    );


    const styles =
        getComputedStyle(
            document.body
        );


    const background =
        styles.getPropertyValue(
            "--background"
        );


    const primary =
        styles.getPropertyValue(
            "--primary"
        );


    const text =
        styles.getPropertyValue(
            "--text"
        );


    const muted =
        styles.getPropertyValue(
            "--muted"
        );


    if (!rows.length) {

        ctx.fillStyle =
            muted;


        ctx.font =
            "14px system-ui";


        ctx.textAlign =
            "center";


        ctx.fillText(
            "No expense data yet",
            width / 2,
            height / 2
        );


        return;

    }


    const max =
        Math.max(
            ...rows.map(
                row =>
                    row[1]
            ),
            1
        );


    const left =
        Math.min(
            185,
            width * 0.38
        );


    const barHeight = 22;

    const gap = 17;


    rows.forEach(
        ([category, amount], index) => {

            const y =
                20 +
                index *
                (
                    barHeight +
                    gap
                );


            const availableWidth =
                width -
                left -
                25;


            const barWidth =
                (
                    amount /
                    max
                ) *
                availableWidth;


            /* BACKGROUND */

            ctx.fillStyle =
                background;


            ctx.fillRect(
                left,
                y,
                availableWidth,
                barHeight
            );


            /* BAR */

            ctx.fillStyle =
                primary;


            ctx.fillRect(
                left,
                y,
                barWidth,
                barHeight
            );


            /* CATEGORY */

            ctx.fillStyle =
                text;


            ctx.font =
                "11px system-ui";


            ctx.textAlign =
                "right";


            ctx.fillText(
                category,
                left - 10,
                y + 15
            );


            /* AMOUNT */

            ctx.textAlign =
                "left";


            ctx.fillText(
                compactMoney(
                    amount
                ),
                left +
                    barWidth +
                    7,
                y + 15
            );

        }
    );

}


/* =========================================================
   RENDER CHARTS
========================================================= */

function renderCharts() {

    /* Weekly spending remains a bar chart */

    drawBarChart(
        $("weeklyChart"),
        getDailyData()
    );


    /* Monthly spending becomes a LINE chart */

    drawLineChart(
        $("monthlyChart"),
        getMonthlyData()
    );


    /* Category spending */

    renderAnalyticsCategoryList();

}


/* =========================================================
   ANALYTICS
========================================================= */

function renderAnalytics() {

    const expenses =
        transactions.filter(
            transaction =>
                transaction.type ===
                "expense"
        );


    const categories =
        getCategoryTotals();


    const total =
        categories.reduce(
            (sum, row) =>
                sum + row[1],
            0
        );


    $("topCategory")
        .textContent =
        categories.length
            ? categories[0][0]
            : "—";


    const average =
        expenses.length
            ? total /
              expenses.length
            : 0;


    $("averageExpense")
        .textContent =
        money(
            average
        );


    const largest =
        Math.max(
            0,
            ...expenses.map(
                transaction =>
                    Number(
                        transaction.amount
                    )
            )
        );


    $("largestExpense")
        .textContent =
        money(
            largest
        );


    let days = 1;


    if (expenses.length) {

        const earliest =
            Math.min(
                ...expenses.map(
                    transaction =>
                        new Date(
                            transaction.date
                        ).getTime()
                )
            );


        days =
            Math.max(
                1,
                Math.ceil(
                    (
                        Date.now() -
                        earliest
                    ) /
                    86400000
                ) + 1
            );

    }


    $("dailyAverage")
        .textContent =
        money(
            total /
            days
        );

}


/* =========================================================
   PAGE NAVIGATION
========================================================= */

function showPage(page) {

    document
        .querySelectorAll(".page")
        .forEach(section => {
            section.classList.remove("active");
        });

    const selectedPage =
        $(page + "Page");

    if (selectedPage) {
        selectedPage.classList.add("active");
    }

    document
        .querySelectorAll(".nav-btn")
        .forEach(button => {
            button.classList.toggle(
                "active",
                button.dataset.page === page
            );
        });

    const titles = {
        dashboard: "Dashboard",
        transactions: "Transactions",
        analytics: "Analytics",
        backup: "Backup & Data",
        categories: "Category Spending",
        budget: "Budget & Goals",
        reminders: "Payment Reminders"
    };

    if ($("pageTitle")) {
        $("pageTitle").textContent =
            titles[page] || "Dashboard";
    }

    if (page === "analytics") {
        setTimeout(renderCharts, 30);
    }

    if (["categories", "budget", "reminders"].includes(page)) {
        setTimeout(renderFinance, 0);
    }

}


/* NAV BUTTONS */

document
    .querySelectorAll(".nav-btn")
    .forEach(
        button => {

            button.addEventListener(
                "click",
                () =>
                    showPage(
                        button.dataset.page
                    )
            );

        }
    );


/* VIEW ALL */

document
    .querySelectorAll(
        "[data-page-link]"
    )
    .forEach(
        button => {

            button.addEventListener(
                "click",
                () =>
                    showPage(
                        button.dataset.pageLink
                    )
            );

        }
    );


/* =========================================================
   FILTER EVENTS
========================================================= */

[
    "searchInput",
    "typeFilter",
    "categoryFilter",
    "monthFilter",
    "sortFilter"

].forEach(
    id => {

        $(id)
            .addEventListener(
                "input",
                renderHistory
            );


        $(id)
            .addEventListener(
                "change",
                renderHistory
            );

    }
);


/* =========================================================
   FILE DOWNLOAD
========================================================= */

function downloadFile(
    filename,
    content,
    type
) {

    const blob =
        new Blob(
            [content],
            { type }
        );


    const url =
        URL.createObjectURL(
            blob
        );


    const link =
        document.createElement(
            "a"
        );


    link.href =
        url;


    link.download =
        filename;


    document.body.appendChild(
        link
    );


    link.click();


    link.remove();


    URL.revokeObjectURL(
        url
    );

}


/* =========================================================
   EXPORT JSON
========================================================= */

$("exportJsonBtn")
    .addEventListener(
        "click",
        () => {

            const json =
                JSON.stringify(
                    transactions.map(transaction => ({
                        ...transaction,
                        displayId: String(transaction.displayId || transaction.id)
                    })),
                    null,
                    2
                );


            const filename =
                `moneymate-backup-${
                    new Date()
                        .toISOString()
                        .slice(
                            0,
                            10
                        )
                }.json`;


            downloadFile(
                filename,
                json,
                "application/json"
            );


            showToast(
                "JSON backup exported."
            );

        }
    );


/* =========================================================
   EXPORT CSV
========================================================= */

$("exportCsvBtn")
    .addEventListener(
        "click",
        () => {

            const headers = [

                "ID",

                "Type",

                "Amount",

                "Name",

                "Category",

                "Date",

                "Payment Method",

                "Note"

            ];


            const rows = [

                headers,

                ...transactions.map(
                    transaction => [

                        String(transaction.displayId || transaction.id),

                        transaction.type,

                        transaction.amount,

                        transaction.name,

                        transaction.category,

                        `${formatDate(
                            transaction.date
                        )} ${new Date(
                            transaction.date
                        ).toLocaleTimeString(
                            "en-IN",
                            {
                                hour:
                                    "2-digit",

                                minute:
                                    "2-digit"
                            }
                        )}`,

                        transaction.paymentMethod,

                        transaction.note

                    ]
                )

            ];


            const csv =
                rows
                    .map(
                        row =>
                            row
                                .map(
                                    value =>
                                        `"${String(
                                            value ??
                                            ""
                                        ).replace(
                                            /"/g,
                                            '""'
                                        )}"`
                                )
                                .join(",")
                    )
                    .join("\n");


            const filename =
                `moneymate-transactions-${
                    new Date()
                        .toISOString()
                        .slice(
                            0,
                            10
                        )
                }.csv`;


            downloadFile(
                filename,
                csv,
                "text/csv;charset=utf-8"
            );


            showToast(
                "CSV exported."
            );

        }
    );


/* =========================================================
   IMPORT JSON — MERGE WITHOUT DELETING EXISTING TRANSACTIONS

   Each imported row is retained, including rows whose displayed
   ID matches an existing transaction. `id` is the private unique
   key used internally/cloud-side; `displayId` preserves the ID
   from the imported backup so duplicate displayed IDs are allowed.
========================================================= */

$("importJsonBtn")
    .addEventListener("click", () => $("importFile").click());

$("importFile")
    .addEventListener("change", event => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();

        reader.onload = async () => {
            try {
                const data = JSON.parse(reader.result);
                if (!Array.isArray(data)) {
                    throw new Error("Invalid backup: expected a transaction array.");
                }

                const validRows = data.filter(transaction =>
                    transaction &&
                    transaction.type &&
                    Number.isFinite(Number(transaction.amount)) &&
                    Number(transaction.amount) > 0 &&
                    String(transaction.name || "").trim()
                );

                if (!validRows.length) {
                    showToast("No valid transactions found in this backup.");
                    return;
                }

                const confirmed = confirm(
                    `Import ${validRows.length} transactions? Existing transactions will be kept. Imported rows will be added, even when their displayed IDs match existing rows.`
                );
                if (!confirmed) return;

                const existingInternalIds = new Set(transactions.map(t => String(t.id)));
                const imported = validRows.map(transaction => {
                    const originalId = String(
                        transaction.displayId ?? transaction.id ?? createId()
                    );
                    let internalId = createId();
                    while (existingInternalIds.has(internalId)) internalId = createId();
                    existingInternalIds.add(internalId);

                    return {
                        ...transaction,
                        id: internalId,
                        displayId: originalId,
                        amount: Number(transaction.amount),
                        name: String(transaction.name).trim(),
                        category: normalizeCategory(String(transaction.category || "📦 Other")),
                        date: transaction.date && !Number.isNaN(new Date(transaction.date).getTime())
                            ? new Date(transaction.date).toISOString()
                            : new Date().toISOString(),
                        paymentMethod: transaction.paymentMethod || transaction.payment_method || "Other",
                        note: transaction.note || ""
                    };
                });

                // Merge by appending. Never replace or remove current transactions.
                transactions = [...transactions, ...imported];
                saveTransactions();
                renderAll();

                showToast(`Imported ${imported.length} transactions. Existing data was preserved.`);
                if (syncUser) {
                    await flushSync();
                    if (isDirty()) {
                        showToast("Imported locally; cloud sync will retry when available.");
                    }
                }
            } catch (error) {
                console.error("Import failed:", error);
                showToast("Invalid JSON backup. No existing data was changed.");
            } finally {
                event.target.value = "";
            }
        };

        reader.readAsText(file);
    });


/* =========================================================
   CLEAR DATA
========================================================= */

$("clearDataBtn")
    .addEventListener(
        "click",
        () => {

            if (
                !transactions.length
            ) {

                showToast(
                    "There is no data to clear."
                );

                return;

            }


            const confirmed =
                confirm(
                    "Delete ALL transactions? This cannot be undone unless you have a backup."
                );


            if (!confirmed)
                return;


            transactions =
                [];


            saveTransactions();


            renderAll();


            showToast(
                "All data cleared."
            );

        }
    );


/* =========================================================
   DARK / LIGHT MODE
========================================================= */

function updateThemeButton() {

    const dark =
        document.body
            .classList
            .contains("dark");


    $("themeToggle")
        .textContent =
        dark
            ? "☀️ Light Mode"
            : "🌙 Dark Mode";

}


$("themeToggle")
    .addEventListener(
        "click",
        () => {

            document.body
                .classList
                .toggle("dark");


            const dark =
                document.body
                    .classList
                    .contains("dark");


            localStorage.setItem(
                THEME_KEY,
                dark
                    ? "dark"
                    : "light"
            );


            updateThemeButton();


            renderCharts();

        }
    );


/* LOAD SAVED THEME */

if (
    localStorage.getItem(
        THEME_KEY
    ) === "dark"
) {

    document.body
        .classList
        .add("dark");

}


updateThemeButton();


/* =========================================================
   TODAY
========================================================= */

$("todayText")
    .textContent =
    new Date()
        .toLocaleDateString(
            "en-IN",
            {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric"
            }
        );


/* =========================================================
   INITIALIZE
========================================================= */

populateCategories();


renderAll();


/* =========================================================
   RENDER EVERYTHING
========================================================= */

function renderAll() {

    renderSummary();

    renderRecentTransactions();

    renderHistory();

    renderCategoryBreakdown();

    renderAnalytics();

    renderCharts();

}


/* =========================================================
   RESPONSIVE CHART REDRAW
========================================================= */

let resizeTimer;


window.addEventListener(
    "resize",
    () => {

        clearTimeout(
            resizeTimer
        );


        resizeTimer =
            setTimeout(
                renderCharts,
                100
            );

    }
);


/* =========================================================
   COMPLETE MONEY MATE ENHANCEMENTS
   Integrated into the original application so no original
   features are overwritten by duplicate functions.
========================================================= */

const FINANCE_CATEGORIES = CATEGORIES.filter(
    category => category !== "💼 Salary"
);

const PAYMENT_METHOD_OPTIONS = [
    ["Cash", "💵 Cash"],
    ["UPI", "📱 UPI"],
    ["Debit Card", "💳 Debit Card"],
    ["Credit Card", "💳 Credit Card"],
    ["Net Banking", "🏦 Net Banking"],
    ["Other", "•• Other"]
];

const CATEGORY_ALIASES = {
    "⚡ Electric Bill": "⚡ Electricity Bill",
    "⚡ Electricity Bill": "⚡ Electricity Bill",
    "👕 Clothes": "👕 Clothing",
    "🎁 Gift": "🎁 Gifts",
    "🐾 Pet": "🐶 Pets",
    "🔄 Subscription": "🔄 Subscriptions",
    "🔐 Home Security Money": "🔐 Home Security"
};

function normalizeCategory(category) {
    return CATEGORY_ALIASES[category] || category;
}

function normalizeStoredTransactions() {
    let changed = false;

    transactions = transactions.map(transaction => {
        const normalized = normalizeCategory(transaction.category);
        const displayId = String(transaction.displayId || transaction.id);

        if (normalized !== transaction.category || transaction.displayId !== displayId) {
            changed = true;
            return {
                ...transaction,
                displayId,
                category: normalized
            };
        }

        return transaction;
    });

    if (changed) saveTransactions();
}

function categoryIcon(category) {
    return String(category || "📦").split(" ")[0];
}

function categoryLabel(category) {
    return String(category || "")
        .replace(/^\S+\s+/, "")
        .trim();
}

function categoryKey(category) {
    return encodeURIComponent(String(category || ""));
}

function getCategoryBudgetKey(category) {
    return `mmCategoryBudget_${categoryKey(category)}`;
}

function getCategoryBudget(category) {
    return Number(
        localStorage.getItem(getCategoryBudgetKey(category)) || 0
    );
}

function setCategoryBudget(category, value) {
    const amount = Number(value) || 0;

    if (amount > 0) {
        localStorage.setItem(
            getCategoryBudgetKey(category),
            String(amount)
        );
    } else {
        localStorage.removeItem(
            getCategoryBudgetKey(category)
        );
    }

    onLocalSettingsSaved();
}

function injectFinanceStyles() {
    if ($("moneymateFinanceStyles")) return;

    const style = document.createElement("style");
    style.id = "moneymateFinanceStyles";
    style.textContent = `
        /* Finance pages use unique class names so they never
           inherit the generic .category-row layout. */
        #fullCategoryList,
        #categoryBudgetList {
            display:flex;
            flex-direction:column;
            gap:10px;
            width:100%;
        }

        #fullCategoryList {
            max-height:560px;
            overflow-y:auto;
            overflow-x:hidden;
            padding-right:4px;
        }

        .mm-spending-row {
            width:100%;
            min-height:70px;
            display:grid;
            grid-template-columns:42px minmax(0,1fr) auto;
            align-items:center;
            gap:12px;
            padding:11px 13px;
            border:1px solid var(--border);
            border-radius:14px;
            background:var(--background);
            color:var(--text);
            text-align:left;
            cursor:pointer;
            transition:transform .18s ease,border-color .18s ease,background .18s ease,box-shadow .18s ease;
        }

        .mm-spending-row:hover,
        .mm-spending-row:focus-visible {
            border-color:var(--primary);
            background:var(--surface);
            transform:translateY(-1px);
            box-shadow:0 7px 18px rgba(0,0,0,.12);
            outline:none;
        }

        .mm-category-icon {
            width:38px;
            height:38px;
            display:grid;
            place-items:center;
            border-radius:11px;
            background:var(--primary-light);
            font-size:18px;
            flex:none;
        }

        .mm-spending-info {
            min-width:0;
        }

        .mm-category-title {
            display:block;
            color:var(--text);
            font-size:13px;
            font-weight:800;
            line-height:1.25;
            white-space:nowrap;
            overflow:hidden;
            text-overflow:ellipsis;
            margin-bottom:8px;
        }

        .mm-progress-track {
            width:100%;
            height:7px;
            background:var(--surface);
            border-radius:999px;
            overflow:hidden;
        }

        .mm-progress-fill {
            height:100%;
            min-width:2px;
            background:var(--primary);
            border-radius:999px;
            transition:width .35s ease;
        }

        .mm-spending-value {
            min-width:88px;
            color:var(--text);
            font-size:13px;
            font-weight:850;
            text-align:right;
            white-space:nowrap;
        }

        .mm-spending-percent {
            display:block;
            margin-top:3px;
            color:var(--muted);
            font-size:11px;
            font-weight:650;
        }

        .mm-budget-row {
            width:100%;
            min-height:64px;
            display:grid;
            grid-template-columns:minmax(0,1fr) 220px;
            align-items:center;
            gap:20px;
            padding:10px 13px;
            border:1px solid var(--border);
            border-radius:14px;
            background:var(--background);
            color:var(--text);
            transition:border-color .18s ease,background .18s ease,transform .18s ease;
        }

        .mm-budget-row:hover {
            border-color:var(--primary);
            background:var(--surface);
            transform:translateY(-1px);
        }

        .mm-budget-category {
            min-width:0;
            display:flex;
            align-items:center;
            gap:11px;
            color:var(--text);
            font-size:14px;
            font-weight:800;
        }

        .mm-budget-category-text {
            min-width:0;
            overflow:hidden;
            text-overflow:ellipsis;
            white-space:nowrap;
        }

        .mm-budget-input {
            width:100%;
            min-width:0;
            height:44px;
            padding:9px 12px;
            border:1px solid var(--border);
            border-radius:11px;
            background:var(--surface);
            color:var(--text);
            outline:none;
        }

        .mm-budget-input:focus {
            border-color:var(--primary);
            box-shadow:0 0 0 3px rgba(91,92,226,.12);
        }

        .mm-budget-summary {
            margin-top:10px;
            padding:12px 14px;
            border:1px solid var(--border);
            border-radius:12px;
            background:var(--background);
            color:var(--text);
        }

        .mm-finance-section-note {
            margin:4px 0 0;
            color:var(--muted);
            font-size:12px;
        }

        .mm-goal-card {
            padding:13px 14px;
            margin-bottom:9px;
            border:1px solid var(--border);
            border-radius:13px;
            background:var(--background);
            color:var(--text);
        }

        .mm-goal-top {
            display:flex;
            justify-content:space-between;
            gap:12px;
            align-items:center;
        }

        .mm-goal-name {
            min-width:0;
            font-weight:800;
            color:var(--text);
            overflow:hidden;
            text-overflow:ellipsis;
            white-space:nowrap;
        }

        .mm-goal-percent {
            color:var(--muted);
            font-size:12px;
            white-space:nowrap;
        }

        .mm-reminder-row {
            display:grid;
            grid-template-columns:38px minmax(0,1fr) auto;
            align-items:center;
            gap:11px;
            padding:11px;
            margin-bottom:8px;
            border:1px solid var(--border);
            border-radius:12px;
            background:var(--background);
        }

        .mm-reminder-name {
            min-width:0;
            color:var(--text);
            font-weight:750;
            overflow:hidden;
            text-overflow:ellipsis;
            white-space:nowrap;
        }

        .mm-reminder-date {
            color:var(--muted);
            font-size:12px;
            white-space:nowrap;
        }

        .mm-delete-small {
            border:1px solid var(--border);
            background:transparent;
            color:var(--text);
            border-radius:9px;
            width:32px;
            height:32px;
            cursor:pointer;
        }

        .mm-delete-small:hover {
            border-color:var(--danger,#ef4444);
            color:var(--danger,#ef4444);
        }

        .mm-analytics-list {
            display:flex;
            flex-direction:column;
            gap:9px;
            width:100%;
            max-height:540px;
            overflow-y:auto;
            padding:3px 2px 3px 0;
        }

        .mm-analytics-row {
            display:grid;
            grid-template-columns:30px 38px minmax(0,1fr) auto;
            align-items:center;
            gap:10px;
            min-height:60px;
            padding:9px 10px;
            border:1px solid var(--border);
            border-radius:13px;
            background:var(--background);
            color:var(--text);
            cursor:pointer;
            text-align:left;
        }

        .mm-analytics-row:hover {
            border-color:var(--primary);
            background:var(--surface);
        }

        .mm-rank {
            color:var(--muted);
            font-size:12px;
            font-weight:800;
            text-align:center;
        }

        .mm-analytics-info {
            min-width:0;
        }

        .mm-analytics-name {
            display:block;
            color:var(--text);
            font-size:12px;
            font-weight:800;
            white-space:nowrap;
            overflow:hidden;
            text-overflow:ellipsis;
            margin-bottom:6px;
        }

        .mm-analytics-value {
            min-width:86px;
            color:var(--text);
            font-size:12px;
            font-weight:850;
            text-align:right;
            white-space:nowrap;
        }

        .mm-analytics-percent {
            display:block;
            color:var(--muted);
            font-size:10px;
            margin-top:2px;
        }

        @media (max-width:700px) {
            .mm-budget-row {
                grid-template-columns:1fr;
                gap:9px;
            }

            .mm-budget-category {
                min-width:0;
            }

            .mm-budget-category-text {
                white-space:normal;
                overflow:visible;
                text-overflow:clip;
            }
        }

        @media (max-width:500px) {
            .mm-spending-row {
                grid-template-columns:38px minmax(0,1fr);
            }

            .mm-spending-value {
                grid-column:2;
                text-align:left;
                min-width:0;
            }

            .mm-analytics-row {
                grid-template-columns:26px 36px minmax(0,1fr);
            }

            .mm-analytics-value {
                grid-column:3;
                text-align:left;
                min-width:0;
            }
        }
    `;

    document.head.appendChild(style);
}

function populateYearFilter() {
    const select = $("yearFilter");
    if (!select) return;

    const current = select.value;
    const years = [
        ...new Set(
            transactions
                .map(t => (t.date || "").slice(0, 4))
                .filter(Boolean)
        )
    ].sort().reverse();

    select.innerHTML =
        `<option value="all">All Years</option>` +
        years
            .map(year => `<option value="${escapeHTML(year)}">${escapeHTML(year)}</option>`)
            .join("");

    select.value = years.includes(current)
        ? current
        : "all";
}

function addAdvancedFilters() {
    const box =
        document.querySelector("#transactionsPage .filters");

    if (!box || $("yearFilter")) return;

    box.insertAdjacentHTML("beforeend", `
        <select id="yearFilter" aria-label="Filter by year">
            <option value="all">All Years</option>
        </select>

        <input
            id="minAmountFilter"
            type="number"
            min="0"
            step="0.01"
            placeholder="Min Amount"
            aria-label="Minimum amount"
        >

        <input
            id="maxAmountFilter"
            type="number"
            min="0"
            step="0.01"
            placeholder="Max Amount"
            aria-label="Maximum amount"
        >

        <select id="paymentMethodFilter" aria-label="Filter by payment method">
            <option value="all">All Payments</option>
            ${PAYMENT_METHOD_OPTIONS.map(
                ([value, label]) =>
                    `<option value="${escapeHTML(value)}">${escapeHTML(label)}</option>`
            ).join("")}
        </select>

        <input id="fromDateFilter" type="date" aria-label="From date">
        <input id="toDateFilter" type="date" aria-label="To date">
    `);

    [
        "yearFilter",
        "minAmountFilter",
        "maxAmountFilter",
        "paymentMethodFilter",
        "fromDateFilter",
        "toDateFilter"
    ].forEach(id => {
        const element = $(id);
        if (!element) return;
        element.addEventListener("input", renderHistory);
        element.addEventListener("change", renderHistory);
    });

    populateYearFilter();
}

function resetTransactionFilters() {
    const defaults = {
        searchInput: "",
        typeFilter: "all",
        categoryFilter: "all",
        monthFilter: "",
        sortFilter: "date-desc",
        yearFilter: "all",
        minAmountFilter: "",
        maxAmountFilter: "",
        paymentMethodFilter: "all",
        fromDateFilter: "",
        toDateFilter: ""
    };

    Object.entries(defaults).forEach(([id, value]) => {
        const element = $(id);
        if (element) element.value = value;
    });
}

function openCategoryTransactions(category) {
    resetTransactionFilters();

    const filter = $("categoryFilter");

    if (filter) {
        filter.value = normalizeCategory(category);
    }

    showPage("transactions");
    renderHistory();
}

function buildFinancePages() {
    const main = document.querySelector(".main");
    const nav = document.querySelector(".navigation");

    if (!main || !nav || $("categoriesPage")) return;

    nav.insertAdjacentHTML("beforeend", `
        <button class="nav-btn" data-page="categories">
            <span>🏷️</span>
            Categories
        </button>

        <button class="nav-btn" data-page="budget">
            <span>🎯</span>
            Budget & Goals
        </button>

        <button class="nav-btn" data-page="reminders">
            <span>🔔</span>
            Reminders
        </button>
    `);

    main.insertAdjacentHTML("beforeend", `
        <section class="page" id="categoriesPage">
            <section class="panel">
                <div class="panel-header">
                    <div>
                        <h2>Category Spending</h2>
                        <p>Click a category to see all its payments.</p>
                    </div>
                </div>

                <div id="fullCategoryList"></div>
            </section>
        </section>

        <section class="page" id="budgetPage">
            <section class="panel">
                <div class="panel-header">
                    <div>
                        <h2>🎯 Monthly Budget</h2>
                        <p>Set your overall monthly spending limit.</p>
                    </div>
                </div>

                <div class="form-grid">
                    <label>
                        Monthly Budget
                        <input
                            id="monthlyBudgetInput"
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="10000"
                        >
                    </label>

                    <label>
                        &nbsp;
                        <button
                            class="primary-button"
                            id="saveBudgetBtn"
                            type="button"
                        >
                            Save Budget
                        </button>
                    </label>
                </div>

                <div id="budgetStatus" class="mm-budget-summary"></div>
            </section>

            <section class="panel">
                <div class="panel-header">
                    <div>
                        <h2>🏷️ Category-wise Budgets</h2>
                        <p class="mm-finance-section-note">
                            Set a separate budget for every expense category.
                        </p>
                    </div>
                </div>

                <div id="categoryBudgetList"></div>
            </section>

            <section class="panel">
                <div class="panel-header">
                    <div>
                        <h2>💰 Savings Goals</h2>
                        <p class="mm-finance-section-note">
                            Track progress toward your personal goals.
                        </p>
                    </div>
                </div>

                <div class="form-grid">
                    <label>
                        Goal Name
                        <input id="goalName" type="text" placeholder="New Laptop">
                    </label>

                    <label>
                        Target Amount
                        <input id="goalTarget" type="number" min="0" step="0.01">
                    </label>

                    <label>
                        Saved Amount
                        <input id="goalSaved" type="number" min="0" step="0.01" value="0">
                    </label>

                    <label>
                        &nbsp;
                        <button
                            class="primary-button"
                            id="addGoalBtn"
                            type="button"
                        >
                            Add Goal
                        </button>
                    </label>
                </div>

                <div id="goalsList"></div>
            </section>

            <section class="panel">
                <div class="panel-header">
                    <div>
                        <h2>🤖 Smart Spending Insights</h2>
                    </div>
                </div>

                <div id="insightsList"></div>
            </section>
        </section>

        <section class="page" id="remindersPage">
            <section class="panel">
                <div class="panel-header">
                    <div>
                        <h2>🔔 Payment Reminders</h2>
                        <p class="mm-finance-section-note">
                            Keep track of upcoming payments.
                        </p>
                    </div>
                </div>

                <div class="form-grid">
                    <label>
                        Reminder
                        <input
                            id="reminderName"
                            type="text"
                            placeholder="Electricity Bill"
                        >
                    </label>

                    <label>
                        Date
                        <input id="reminderDate" type="date">
                    </label>

                    <label>
                        &nbsp;
                        <button
                            class="primary-button"
                            id="addReminderBtn"
                            type="button"
                        >
                            Add Reminder
                        </button>
                    </label>
                </div>

                <div id="remindersList"></div>
            </section>
        </section>
    `);

    document
        .querySelectorAll(".nav-btn")
        .forEach(button => {
            button.addEventListener("click", () => {
                showPage(button.dataset.page);
            });
        });

    $("saveBudgetBtn")?.addEventListener("click", saveMonthlyBudget);
    $("addGoalBtn")?.addEventListener("click", addGoal);
    $("addReminderBtn")?.addEventListener("click", addReminder);
}

function getStore(key, fallback) {
    try {
        const raw = localStorage.getItem(key);
        return raw === null ? fallback : JSON.parse(raw);
    } catch {
        return fallback;
    }
}

function setStore(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
    onLocalSettingsSaved();
}

function expensesThisMonth() {
    const currentMonth =
        new Date().toISOString().slice(0, 7);

    return transactions
        .filter(transaction =>
            transaction.type === "expense" &&
            (transaction.date || "").slice(0, 7) === currentMonth
        )
        .reduce(
            (sum, transaction) =>
                sum + Number(transaction.amount || 0),
            0
        );
}

function saveMonthlyBudget() {
    const input = $("monthlyBudgetInput");
    if (!input) return;

    const value = Number(input.value || 0);

    if (value < 0) {
        showToast("Budget cannot be negative.");
        return;
    }

    setStore("mmBudget", value);
    renderFinance();
    showToast("Monthly budget saved.");
}

function renderCategorySpendingList() {
    const container = $("fullCategoryList");
    if (!container) return;

    const rows = getCategoryTotals();

    if (!rows.length) {
        container.innerHTML = `
            <div class="empty">
                <strong>No expense data yet.</strong>
                Add an expense to see category spending here.
            </div>
        `;
        return;
    }

    const max = Math.max(
        ...rows.map(([, amount]) => amount),
        1
    );

    container.innerHTML = rows.map(
        ([category, amount]) => {

            const width = (amount / max) * 100;

            return `
                <div
                    class="simple-category-row"
                    data-category-key="${categoryKey(category)}"
                >

                    <div class="simple-category-name">
                        <span class="simple-category-icon">
                            ${escapeHTML(categoryIcon(category))}
                        </span>

                        <span>
                            ${escapeHTML(categoryLabel(category))}
                        </span>
                    </div>

                    <div class="simple-category-line-area">
                        <span
                            class="simple-category-line"
                            style="width:${Math.max(2, width)}%"
                        ></span>
                    </div>

                    <div class="simple-category-amount">
                        ${money(amount)}
                    </div>

                </div>
            `;
        }
    ).join("");

    container
        .querySelectorAll("[data-category-key]")
        .forEach(row => {
            row.addEventListener("click", () => {

                const category = decodeURIComponent(
                    row.dataset.categoryKey
                );

                openCategoryTransactions(category);
            });
        });
}

function renderCategoryBudgets() {
    const container = $("categoryBudgetList");
    if (!container) return;

    container.innerHTML = FINANCE_CATEGORIES.map(category => {
        const budget = getCategoryBudget(category);

        return `
            <div class="mm-budget-row">
                <div class="mm-budget-category">
                    <span class="mm-category-icon">
                        ${escapeHTML(categoryIcon(category))}
                    </span>

                    <span class="mm-budget-category-text">
                        ${escapeHTML(categoryLabel(category))}
                    </span>
                </div>

                <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Budget"
                    value="${budget || ""}"
                    class="mm-budget-input"
                    data-category-budget="${categoryKey(category)}"
                    aria-label="${escapeHTML(categoryLabel(category))} budget"
                >
            </div>
        `;
    }).join("");

    container
        .querySelectorAll("[data-category-budget]")
        .forEach(input => {
            input.addEventListener("change", () => {
                const category = decodeURIComponent(
                    input.dataset.categoryBudget
                );
                setCategoryBudget(category, input.value);
                showToast(`${categoryLabel(category)} budget saved.`);
            });
        });
}

function renderGoals() {
    const container = $("goalsList");
    if (!container) return;

    const goals = getStore("mmGoals", []);

    if (!goals.length) {
        container.innerHTML = `
            <div class="empty">
                No savings goals yet.
            </div>
        `;
        return;
    }

    container.innerHTML = goals.map((goal, index) => {
        const target = Number(goal.target) || 0;
        const saved = Number(goal.saved) || 0;
        const percent = target
            ? Math.min(100, Math.round((saved / target) * 100))
            : 0;

        return `
            <div class="mm-goal-card">
                <div class="mm-goal-top">
                    <span class="mm-goal-name">
                        🎯 ${escapeHTML(goal.name)}
                    </span>

                    <span class="mm-goal-percent">
                        ${percent}%
                    </span>
                </div>

                <div class="tx-meta" style="margin:7px 0">
                    ${money(saved)} / ${money(target)}
                </div>

                <div class="mm-progress-track">
                    <div
                        class="mm-progress-fill"
                        style="width:${percent}%"
                    ></div>
                </div>
            </div>
        `;
    }).join("");
}

function renderReminders() {
    const container = $("remindersList");
    if (!container) return;

    const reminders = getStore("mmReminders", []);

    if (!reminders.length) {
        container.innerHTML = `
            <div class="empty">
                No reminders yet.
            </div>
        `;
        return;
    }

    container.innerHTML = reminders.map((reminder, index) => `
        <div class="mm-reminder-row">
            <div class="mm-category-icon">🔔</div>

            <div>
                <div class="mm-reminder-name">
                    ${escapeHTML(reminder.name)}
                </div>
                <div class="mm-reminder-date">
                    ${escapeHTML(reminder.date)}
                </div>
            </div>

            <button
                type="button"
                class="mm-delete-small"
                data-reminder-index="${index}"
                title="Delete reminder"
                aria-label="Delete reminder"
            >
                ×
            </button>
        </div>
    `).join("");

    container
        .querySelectorAll("[data-reminder-index]")
        .forEach(button => {
            button.addEventListener("click", () => {
                const index = Number(button.dataset.reminderIndex);
                const current = getStore("mmReminders", []);
                current.splice(index, 1);
                setStore("mmReminders", current);
                renderReminders();
                showToast("Reminder deleted.");
            });
        });
}

function renderFinance() {
    renderCategorySpendingList();
    renderCategoryBudgets();
    renderGoals();
    renderReminders();

    const budget = Number(getStore("mmBudget", 0)) || 0;
    const spent = expensesThisMonth();
    const remaining = budget - spent;
    const percentage = budget
        ? Math.round((spent / budget) * 100)
        : 0;

    if ($("monthlyBudgetInput")) {
        $("monthlyBudgetInput").value = budget || "";
    }

    if ($("budgetStatus")) {
        $("budgetStatus").innerHTML = budget
            ? `
                <strong>Spent: ${money(spent)}</strong>
                <br>
                Remaining:
                ${money(Math.max(0, remaining))}
                <br>
                Progress: ${percentage}%
                <br>
                ${
                    percentage >= 100
                        ? "🚨 Budget exceeded!"
                        : percentage >= 80
                            ? "⚠️ You have spent 80% or more of your budget."
                            : "✅ Budget looks healthy."
                }
            `
            : `
                Set your monthly budget to track progress.
            `;
    }

    if ($("insightsList")) {
        const rows = getCategoryTotals();
        const top = rows[0];

        const previous = new Date();
        previous.setMonth(previous.getMonth() - 1);
        const previousKey = previous.toISOString().slice(0, 7);

        const previousSpent = transactions
            .filter(transaction =>
                transaction.type === "expense" &&
                (transaction.date || "").slice(0, 7) === previousKey
            )
            .reduce(
                (sum, transaction) =>
                    sum + Number(transaction.amount || 0),
                0
            );

        $("insightsList").innerHTML = `
            <div class="mm-budget-summary">
                ${top
                    ? `🔥 Most spent category: <strong>${escapeHTML(categoryLabel(top[0]))}</strong> (${money(top[1])}).`
                    : "Add expenses to get insights."}

                ${previousSpent
                    ? `<br>📊 This month is ${spent > previousSpent ? "higher" : "lower"} than last month by ${money(Math.abs(spent - previousSpent))}.`
                    : ""}
            </div>
        `;
    }
}

function addGoal() {
    const name = ($("goalName")?.value || "").trim();
    const target = Number($("goalTarget")?.value || 0);
    const saved = Number($("goalSaved")?.value || 0);

    if (!name || target <= 0) {
        showToast("Enter a goal name and target amount.");
        return;
    }

    const goals = getStore("mmGoals", []);
    goals.push({
        name,
        target,
        saved: Math.max(0, saved)
    });

    setStore("mmGoals", goals);

    $("goalName").value = "";
    $("goalTarget").value = "";
    $("goalSaved").value = "0";

    renderGoals();
    showToast("Savings goal added.");
}

function addReminder() {
    const name = ($("reminderName")?.value || "").trim();
    const date = $("reminderDate")?.value || "";

    if (!name || !date) {
        showToast("Enter a reminder and date.");
        return;
    }

    const reminders = getStore("mmReminders", []);
    reminders.push({ name, date });

    reminders.sort(
        (a, b) => String(a.date).localeCompare(String(b.date))
    );

    setStore("mmReminders", reminders);

    $("reminderName").value = "";
    $("reminderDate").value = "";

    renderReminders();
    showToast("Reminder added.");
}

function ensureAnalyticsCategoryList() {
    const canvas = $("analyticsCategoryChart");
    if (!canvas) return null;

    if (canvas.tagName.toLowerCase() === "canvas") {
        const replacement = document.createElement("div");
        replacement.id = "analyticsCategoryChart";
        replacement.className = "mm-analytics-list";
        replacement.setAttribute(
            "aria-label",
            "Spending by category"
        );
        canvas.replaceWith(replacement);
        return replacement;
    }

    canvas.classList.add("mm-analytics-list");
    return canvas;
}

function renderAnalyticsCategoryList() {
    const container = ensureAnalyticsCategoryList();
    if (!container) return;

    const rows = getCategoryTotals();

    if (!rows.length) {
        container.innerHTML = `
            <div class="empty">
                No expense data yet.
            </div>
        `;
        return;
    }

    const max = Math.max(
        ...rows.map(([, amount]) => amount),
        1
    );

    container.innerHTML = rows.slice(0, 10).map(
        ([category, amount]) => {

            const width = (amount / max) * 100;

            return `
                <div
                    class="simple-category-row"
                    data-analytics-category="${categoryKey(category)}"
                >

                    <div class="simple-category-name">
                        <span class="simple-category-icon">
                            ${escapeHTML(categoryIcon(category))}
                        </span>

                        <span>
                            ${escapeHTML(categoryLabel(category))}
                        </span>
                    </div>

                    <div class="simple-category-line-area">
                        <span
                            class="simple-category-line"
                            style="width:${Math.max(2, width)}%"
                        ></span>
                    </div>

                    <div class="simple-category-amount">
                        ${money(amount)}
                    </div>

                </div>
            `;
        }
    ).join("");

    container
        .querySelectorAll("[data-analytics-category]")
        .forEach(row => {
            row.addEventListener("click", () => {
                const category = decodeURIComponent(
                    row.dataset.analyticsCategory
                );

                openCategoryTransactions(category);
            });
        });
}


function setupAdvancedFeatures() {
    normalizeStoredTransactions();
    injectFinanceStyles();
    addAdvancedFilters();
    buildFinancePages();
    populateCategories();
    populateYearFilter();
    renderFinance();
    renderAnalyticsCategoryList();
}

/* =========================================================
   OVERRIDES THAT ARE INTENTIONAL AND SINGLE-SOURCE
========================================================= */

const originalRenderAll = renderAll;

renderAll = function () {
    originalRenderAll();
    populateYearFilter();
    renderFinance();
    renderAnalyticsCategoryList();
};

/* =========================================================
   ADVANCED FILTER EVENT SAFETY
========================================================= */

[
    "searchInput",
    "typeFilter",
    "categoryFilter",
    "monthFilter",
    "sortFilter"
].forEach(id => {
    const element = $(id);
    if (!element) return;

    element.addEventListener("input", renderHistory);
    element.addEventListener("change", renderHistory);
});

/* =========================================================
   INITIALIZE ENHANCED FEATURES
========================================================= */

setupAdvancedFeatures();

renderAll();

window.addEventListener("load", () => {
    setupAdvancedFeatures();
    renderAll();
});
/* =========================================================
   SUPABASE CONNECTION TEST
========================================================= */

testSupabaseConnection();
