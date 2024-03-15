// 페이지가 열릴 때 체크된 박스가 없다면 삭제 버튼 disabled
const deleteBtn = document.querySelector(".delete-button");

// 현재 체크된 박스의 개수를 세는 함수
const countCheckBoxes = () => {
  // 각 체크박스의 상태가 변할 때마다 체크된 박스의 개수를 셈
  const checkedBoxes = document.querySelectorAll("input[type='checkbox']:checked")

  // 체크된 박스가 하나라도 있다고 가정하고 삭제 버튼의 disabled 해제
  deleteBtn.disabled = false;

  // 체크된 박스가 하나도 없다면 삭제 버튼 비활성화, 전체 선택 체크 해제
  if (checkedBoxes.length === 0) {
    deleteBtn.disabled = true;
  }
}

// 페이지가 열렸을 때 체크된 박스 개수를 셈
countCheckBoxes();

// 리스트를 표시할 ul 태그
const ul = document.querySelector("ul.list-content");

// 게시물 숫자를 표시할 span 태그
const postCountTag = document.querySelector(".all-num");

// 강의 신고 리스트의 첫 페이지를 화면에 띄워주는 함수
const callFirstLectureReportsList = () => {
  // 만들어둔 모듈을 사용해서 정보를 불러옴
  reportService.getLectureReports(keyword, lecturePage, showReports).then((reports) => {
    ul.innerHTML = reports;

    // 체크박스 클릭 이벤트 추가
    addCheckBoxEvent();
  });
}

// 거래 신고 리스트의 첫 페이지를 화면에 띄워주는 함수
const callFirstTradeReportsList = () => {
  // 만들어둔 모듈을 사용해서 정보를 불러옴
  reportService.getTradeReports(keyword, tradePage, showReports).then((reports) => {
    ul.innerHTML = reports;

    // 체크박스 클릭 이벤트 추가
    addCheckBoxEvent();
  });
}

// 일반 게시물 신고 리스트의 첫 페이지를 화면에 띄워주는 함수
const callFirstPostReportsList = () => {
  // 만들어둔 모듈을 사용해서 정보를 불러옴
  reportService.getPostReports(keyword, postPage, showReports).then((reports) => {
    ul.innerHTML = reports;

    // 체크박스 클릭 이벤트 추가
    addCheckBoxEvent();
  });
}

// 일반 게시물 댓글 신고 리스트의 첫 페이지를 화면에 띄워주는 함수
const callFirstPostReplyReportsList = () => {
  // 만들어둔 모듈을 사용해서 정보를 불러옴
  reportService.getPostReplyReports(keyword, postReplyPage, showReports).then((reports) => {
    ul.innerHTML = reports;

    // 체크박스 클릭 이벤트 추가
    addCheckBoxEvent();
  });
}

// 노하우 게시물 신고 리스트의 첫 페이지를 화면에 띄워주는 함수
const callFirstKnowhowReportsList = () => {
  // 만들어둔 모듈을 사용해서 정보를 불러옴
  reportService.getKnowhowReports(keyword, knowhowPage, showReports).then((reports) => {
    ul.innerHTML = reports;

    // 체크박스 클릭 이벤트 추가
    addCheckBoxEvent();
  });
}

// 노하우 게시물 댓글 신고 리스트의 첫 페이지를 화면에 띄워주는 함수
const callFirstKnowhowReplyReportsList = () => {
  // 만들어둔 모듈을 사용해서 정보를 불러옴
  reportService.getKnowhowReplyReports(keyword, knowhowReplyPage, showReports).then((reports) => {
    ul.innerHTML = reports;

    // 체크박스 클릭 이벤트 추가
    addCheckBoxEvent();
  });
}

// 화면에 신고 내역 표시
callFirstLectureReportsList();

// 삭제 버튼 누르면 뜨는 모달창
document.addEventListener("DOMContentLoaded", function () {
  const deleteButtons = document.querySelectorAll(".delete-button");
  const modalWrap = document.querySelector(".delete-modal-wrap");

  deleteButtons.forEach(function (deleteButton) {
    deleteButton.addEventListener("click", (e) => {
      modalWrap.style.display = "flex";
    });
  });

  const cancelButton = document.querySelector(".modal-cancel button");
  const confirmButton = document.querySelector(".modal-confirm button");

  cancelButton.addEventListener("click", (e) => {
    modalWrap.style.display = "none";
  });

  confirmButton.addEventListener("click", (e) => {
    modalWrap.style.display = "none";
  });
});

//아래 게시물 창 버튼
const paginationBtn = document.querySelectorAll(".page-count-num");
const paginationBox = document.querySelector(".page");

paginationBox.addEventListener("click", (e) => {
  let pageBtn = e.target.closest("button.page-count-num");
  if (pageBtn) {
    paginationBtn.forEach((item) => {
      item.classList.contains("page-count-num") &&
        item.classList.remove("page-count-num-choice");
    });
    pageBtn.classList.add("page-count-num-choice");
  }
});

// 신고 내역 선택 - id -> 클래스로 바꾸기
const catebtns = document.querySelectorAll("button.lecture-info");
const cateUnder = document.querySelectorAll("div.lecture-underbar");
cateUnder[0].classList.add("underbar-checked");
catebtns[0].classList.add("my_lecture-checked");

// 각 신고 내역 버튼에 클릭 이벤트 추가
catebtns.forEach((btn, i) => {
  btn.addEventListener("click", () => {
    // 클릭 되었을 때, 우선 모든 버튼의 밑줄을 삭제하고
    catebtns.forEach((btn, i) => {
      btn.classList.remove("my_lecture-checked");
      cateUnder[i].classList.remove("underbar-checked");
    });

    // 선택한 버튼에만 밑줄 추가
    btn.classList.add("my_lecture-checked");
    cateUnder[i].classList.add("underbar-checked");

    // 어떤 버튼을 클릭했는지에 따라 다른 신고 내역 요청
    btn.classList[1] === "lecture-report" ? callFirstLectureReportsList() :
    btn.classList[1] === "trade-report" ? callFirstTradeReportsList() :
    btn.classList[1] === "post-report" ? callFirstPostReportsList() :
    btn.classList[1] === "post-reply-report" ? callFirstPostReplyReportsList() :
    btn.classList[1] === "knowhow-report" ? callFirstKnowhowReportsList() :
    btn.classList[1] === "knowhow-reply-report" ? callFirstKnowhowReplyReportsList() : false;
  });
});

// 검색창 눌렀을때 검색바에 아웃라인주기
const searchBar = document.querySelector("label.search-bar");

document.addEventListener("click", (e) => {
  if (e.target.closest("label.search-bar")) {
    searchBar.classList.add("search-bar-checked");
    return;
  }
  searchBar.classList.remove("search-bar-checked");
});

const inputField = document.querySelector(".search-bar input");
const cancelButton = document.querySelector(".search-bar .cancel-logo");
const searchButton = document.querySelector(".search-bar .search-logo");

// 입력 필드에 입력 내용이 변경될 때마다 실행될 함수를 정의합니다.
function handleInputChange() {
  const inputValue = inputField.value.trim(); // 입력 내용을 가져옵니다.

  // 입력 내용이 있을 때
  if (inputValue !== "") {
    cancelButton.style.display = "flex"; // cancel-logo를 보여줍니다.
    searchButton.style.display = "none"; // search-logo를 숨깁니다.
  } else {
    // 입력 내용이 없을 때
    cancelButton.style.display = "none"; // cancel-logo를 숨깁니다.
    searchButton.style.display = "flex"; // search-logo를 보여줍니다.
  }
}

// cancel-logo를 클릭했을 때 실행될 함수를 정의합니다.
function handleCancelClick() {
  inputField.value = ""; // 입력 필드 내용을 지웁니다.
  cancelButton.style.display = "none"; // cancel-logo를 숨깁니다.
  searchButton.style.display = "flex"; // search-logo를 보여줍니다.
}

// 입력 필드에 이벤트 리스너를 추가합니다.
inputField.addEventListener("input", handleInputChange);

// cancel-logo에 클릭 이벤트 리스너를 추가합니다.
cancelButton.addEventListener("click", handleCancelClick);

// 체크박스 이벤트 추가 기능 함수화
const addCheckBoxEvent = () => {
  // 체크박스 관련 js
  const allCheck = document.querySelector(".all-check");
  const checkboxes = document.querySelectorAll(".checkbox-input");

  // all-check 체크 여부에 따라 checkbox-input 체크 여부 조절
  allCheck.addEventListener("change", function () {
    checkboxes.forEach(function (checkbox) {
      checkbox.checked = allCheck.checked;

      // 현재 체크된 박스 개수를 세서 삭제 버튼의 활성화 여부 조정
      countCheckBoxes();
    });
  });

  // checkbox-input 중 하나라도 체크가 해제되면 all-check 체크 해제
  checkboxes.forEach(function (checkbox) {
    checkbox.addEventListener("change", function () {
      let allChecked = true;
      checkboxes.forEach(function (checkbox) {
        if (!checkbox.checked) {
          allChecked = false;
        }
      });
      allCheck.checked = allChecked;
    });
  });

  // checkbox-input 모두 체크되면 all-check 체크
  checkboxes.forEach(function (checkbox) {
    checkbox.addEventListener("change", function () {
      let allChecked = true;
      checkboxes.forEach(function (checkbox) {
        if (!checkbox.checked) {
          allChecked = false;
        }
      });
      allCheck.checked = allChecked;
    });
  });

  // 체크박스의 체크 상태가 변할 때마다 체크된 박스 개수를 셈
  checkboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", countCheckBoxes);
  });
}

