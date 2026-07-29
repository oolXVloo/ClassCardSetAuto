/**
 * ClassCard Auto Card Saver
 * 
 * @description Automatically creates and updates word cards on ClassCard using Fetch API.
 * @author Your Name <your.email@example.com>
 * @license MIT
 */

// ============================================================================
// 1. Configuration & Dummy Data
// ============================================================================

/**
 * [세트 ID 설정 안내]
 * 클래스카드 세트 페이지 URL의 맨 끝 숫자를 세트 ID로 사용합니다.
 * 
 * ex)
 * - URL: https://www.classcard.net/set/123456  --> SET_ID = "123456"
 * - URL: https://www.classcard.net/CreateWord/098765 --> SET_ID = "098765"
 */
const SET_ID = "YOUR_SET_ID"; 

// Card Payload Structure
const cardPayload = {
    set_idx: SET_ID,        // URL 끝에서 가져온 세트 번호
    user_idx: "",           // Automatically mapped via server session
    login_user_idx: "",     // Automatically mapped via server session
    set_type: "1",
    footer_yn: "0",
    front_lang: "en",

    // Word Data Arrays (Must have matching length)
    front: ["apple", "banana", "cherry"],
    back: ["사과", "바나나", "체리"],
    example: [
        "An apple a day keeps the doctor away.",
        "Monkeys like bananas.",
        "Red cherry on top."
    ],
    card_order: ["1", "2", "3"],
    card_idx: ["-1", "-1", "-1"],  // '-1' indicates a new card
    deleted: ["0", "0", "0"],       // '0' = active, '1' = delete

    // Default Metadata Arrays (Empty placeholders matching word count)
    img_path: ["", "", ""],
    audio_path: ["", "", ""],
    external_url: ["", "", ""],
    map_bubble_type: ["", "", ""],
    upload_idx: ["-1", "-1", "-1"],
    image_type: ["-1", "-1", "-1"],
    img_idx: ["-1", "-1", "-1"],
    es_idx: ["-1", "-1", "-1"]
};

// ============================================================================
// 2. Browser Console Execution (Option A)
// ============================================================================

/**
 * Executes card save directly from browser console (F12) while logged into ClassCard.
 * No manual cookie handling required.
 */
async function saveCardsInBrowser() {
    try {
        const bodyParams = new URLSearchParams();
        bodyParams.append("data_obj", JSON.stringify(cardPayload));

        const response = await fetch("https://www.classcard.net/CreateWord/saveCard2", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                "X-Requested-With": "XMLHttpRequest"
            },
            body: bodyParams
        });

        const result = await response.json();
        console.log("[Success] Cards saved successfully:", result);
    } catch (error) {
        console.error("[Error] Failed to save cards in browser:", error);
    }
}

// ============================================================================
// 3. Node.js Automated Script (Option B)
// ============================================================================

/**
 * Full automated flow: Login -> Extract Session Cookie -> Save Cards.
 * Run using Node.js v18+ environment.
 */
async function runNodeAutoSave() {
    // Read credentials safely from Environment Variables
    const USER_ID = process.env.CLASSCARD_ID || "YOUR_USERNAME";
    const USER_PW = process.env.CLASSCARD_PW || "YOUR_PASSWORD";

    if (USER_ID === "YOUR_USERNAME") {
        console.warn("Warning: Please set your ClassCard credentials before running Node.js mode.");
        return;
    }

    try {
        // Step 1: Login to obtain session cookie
        console.log("[1/2] Authenticating with ClassCard...");
        const loginParams = new URLSearchParams({
            login_id: USER_ID,
            login_pw: USER_PW
        });

        const loginRes = await fetch("https://www.classcard.net/Login/loginProc", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                "X-Requested-With": "XMLHttpRequest"
            },
            body: loginParams
        });

        // Extract Set-Cookie header
        const rawCookies = loginRes.headers.getSetCookie 
            ? loginRes.headers.getSetCookie() 
            : [loginRes.headers.get("set-cookie")];

        if (!rawCookies || rawCookies.length === 0) {
            throw new Error("Authentication failed. Check your ID and Password.");
        }

        const sessionCookie = rawCookies.map(c => c.split(";")[0]).join("; ");
        console.log("[1/2] Authentication successful!");

        // Step 2: Post card data with session cookie
        console.log("[2/2] Uploading card dataset...");
        const bodyParams = new URLSearchParams();
        bodyParams.append("data_obj", JSON.stringify(cardPayload));

        const saveRes = await fetch("https://www.classcard.net/CreateWord/saveCard2", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                "X-Requested-With": "XMLHttpRequest",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                "Referer": `https://www.classcard.net/CreateWord/${SET_ID}`,
                "Cookie": sessionCookie
            },
            body: bodyParams
        });

        const result = await saveRes.json();
        console.log("[2/2] Upload complete! Response:", result);

    } catch (error) {
        console.error("[Error] Node.js automation process failed:", error);
    }
}

// Uncomment the mode you wish to execute:
// saveCardsInBrowser(); // Run in Browser DevTools
// runNodeAutoSave();   // Run in Node.js environment
