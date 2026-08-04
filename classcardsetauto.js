/**
 * 클래스카드 자동 등록 스크립트 (Pure JS / Node.js용)
 * 입력 인터페이스 없이 아래 INPUT 변수만 직접 수정하여 사용합니다.
 */

// ========================================================
// 💡 [여기서 데이터를 직접 수정하세요]
// ========================================================
const INPUT = {
  // 1. 세트 및 사용자 정보
  set_idx: "30102704",
  user_idx: "6471531",
  login_user_idx: "6471531", // 보통 user_idx와 동일

  // 2. 쿠키 헤더 (로그인 세션 유지용)
  cookieString: "_ga=GA1.1.810945229.1772873409; a=1; s=1; u=1; b_s_idx=7188; login_user_type=2; login_school_type=-1; r=0; auto_dic=1; study_zoom=2; ci_session=f38ac7724c7c078f4ed30e35d41b1e72f23cef4e; teacher20260801=1; u_idx=6471531; u_type=2;",

  // 3. 카드 단어장 텍스트 (영어 \n 한글 순서)
  cardListText: `

191. How long have you been studying English seriously?
너는 얼마나 오랫동안 영어를 진지하게 공부해 왔니?

192. I don't know how to solve this difficult problem.
나는 이 어려운 문제를 어떻게 해결해야 할지 잘 모르겠다.

193. I wish I had more time to study English.
나는 영어를 공부할 시간이 더 많았으면 좋겠다.

194. The number of smartphone users is increasing.
스마트폰을 사용하는 사람들의 수가 증가하고 있다.

195. She was so tired that she fell asleep quickly.
그녀는 너무 피곤해서 금방 잠이 들었다.

196. I have never tried this kind of food.
나는 이런 종류의 음식을 전에 먹어 본 적이 없다.

197. I met an author whose books are very popular.
나는 책들이 매우 인기 있는 한 작가를 만났다.

198. He kept me waiting for a long time.
그는 나를 오랫동안 기다리게 했다.

199. I don't know what to say in this situation.
나는 이 상황에서 무엇을 말해야 할지 모르겠다.

200. It is important for students to manage their time well.
학생들이 시간을 잘 관리하는 것은 중요하다.
  `
};
// ========================================================


/**
 * 텍스트 정제 함수
 */
function parseCardText(rawText) {
  let text = rawText.trim();
  // 1. 번호 패턴 제거 (예: "1. ", "12. ")
  text = text.replace(/^\d+\.\s*/gm, "");
  // 2. 연속 엔터 압축
  text = text.replace(/\n+/g, "\n");
  
  return text.split('\n').filter(line => line.trim() !== "");
}

/**
 * 클래스카드 서버 요청 실행 함수
 */
async function runSave() {
  const globalLines = parseCardText(INPUT.cardListText);

  if (!globalLines || globalLines.length === 0) {
    console.error("❌ 저장할 카드 데이터가 없습니다. INPUT.cardListText를 확인해 주세요.");
    return;
  }

  const cardData = {
    set_idx: INPUT.set_idx,
    user_idx: INPUT.user_idx,
    login_user_idx: INPUT.login_user_idx,
    set_type: "1",
    footer_yn: "0",
    front_lang: "en",

    front: [],
    back: [],
    example: [],
    card_order: [],
    card_idx: [],
    deleted: [],

    img_path: [],
    audio_path: [],
    external_url: [],
    map_bubble_type: [],
    upload_idx: [],
    image_type: [],
    img_idx: [],
    es_idx: []
  };

  for (let i = 0; i < globalLines.length; i += 2) {
    const frontText = globalLines[i];
    const backText = globalLines[i + 1] || "";
    const orderNumber = String((i / 2) + 1);

    cardData.front.push(frontText);
    cardData.back.push(backText);
    cardData.example.push("");
    cardData.card_order.push(orderNumber);
    cardData.card_idx.push("-1");
    cardData.deleted.push("0");

    cardData.img_path.push("");
    cardData.audio_path.push("");
    cardData.external_url.push("");
    cardData.map_bubble_type.push("");
    cardData.upload_idx.push("-1");
    cardData.image_type.push("-1");
    cardData.img_idx.push("-1");
    cardData.es_idx.push("-1");
  }

  const bodyParams = new URLSearchParams();
  bodyParams.append("data_obj", JSON.stringify(cardData));

  console.log(`[시도] 총 ${cardData.front.length}개의 카드를 저장합니다...`);

  try {
    const response = await fetch("https://www.classcard.net/CreateWord/saveCard2", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "Accept": "application/json, text/javascript, */*; q=0.01",
        "X-Requested-With": "XMLHttpRequest",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Referer": `https://classcard.net/${INPUT.set_idx}`,
        "Origin": "https://www.classcard.net",
        "Cookie": INPUT.cookieString
      },
      body: bodyParams
    });

    const responseText = await response.text();

    if (responseText.trim().startsWith("<")) {
      console.warn("쿠키 세션이 만료되었거나 로그인 폼 HTML이 반환되었습니다. Cookie 값을 최신화해주세요.");
      return;
    }

    const result = JSON.parse(responseText);
    console.log("저장 성공 결과:", result);

  } catch (error) {
    console.error("요청 전송 중 오류 발생:", error);
  }
}

// 스크립트 실행
runSave();