import { KendraClient, QueryCommand } from "https://cdn.skypack.dev/@aws-sdk/client-kendra";

const kendra = {
  client: new Object(),   // Kendra client
  lastQueryText: '',      // Last query text
  page: {                 // 데모 버전으로 미구현
    currentPage: 1,
    lastPage: 1,
    scrollChecker: true,    // ScrollChecker
  },

  /**
   * [ Kendra 설정 ]
   */
  init: () => {
    /**
     * region : 본인 AWS Region
     * ex) ap-northeast-1는 도쿄임.
     */
    const region = "여기의 본인 AWS Region 입력";

    /**
     * credentials : 본인 AWS Access key, Secret access key
     */
    const credentials = {
      accessKeyId: "여기에 본인 AWS Access key 입력",
      secretAccessKey: "여기에 본인 Secret access key 입력",
    }

    try {
      /**
       * 본인은 kendra 객체에 넣다 보니 다음고 같이 사용하였음
       * const client = new KendraClient({region, credentials,}); 와 같이 사용해도 됨
       */
      kendra.client = new KendraClient({
        region,
        credentials,
      });
    } catch (err) {
      console.log(err);
    }
  },

  /**
   * [ Kendra 검색 결과 불러오기 ]
   * @param {*} queryText : 사용자 검색 키워드
   * @param {*} page      : 검색 페이지
   * @returns 검색결과
   */
  getQueryCommand: async (queryText, page = 1) => {
    // 신규 검색인 경우
    if (page === 1) {
      kendra.lastQueryText = queryText;

      // 조건(Bool) 검색이 존재하는 경우 (페이징 검색의 경우 기존 쿼리 그래도 사용하면 됨!)
      const tagBtns = document.querySelectorAll('.tag-btn');
      if (tagBtns.length > 0) {
        tagBtns.forEach((tag) => {
          const option = tag.getAttribute('option');
          const value = tag.getAttribute('value');

          kendra.lastQueryText = kendra.lastQueryText + ` ${option} ${value}`;
        });
      }

      // 맨 앞 검색 키워드의 Operator 제거
      kendra.lastQueryText = util.removeOperator(kendra.lastQueryText);

      // 조건(날짜) 검색이 존재하는 경우
      const dateTagBtns = document.querySelectorAll('.date-tag-btn');
      if (dateTagBtns.length > 0) {
        kendra.lastQueryText = `(${kendra.lastQueryText})`;
        dateTagBtns.forEach((dateTag) => {
          const option = dateTag.getAttribute('option');
          const value = dateTag.getAttribute('value');

          kendra.lastQueryText = kendra.lastQueryText + ` ${option}${value}`;
        });
      }
    }

    // 맨 앞 검색 키워드의 Operator 제거
    kendra.lastQueryText = util.removeOperator(kendra.lastQueryText);

    const input = {
      IndexId: "여기에 본인 Kendra IndexId 입력",
      QueryText: kendra.lastQueryText,
      PageNumber: page,
      PageSize: 10,       // 10 ~ 100(max)
      AttributeFilter: {
        AndAllFilters: [
          {
            EqualsTo: {
              "Key": "_language_code",  // 언어 지정
              "Value": {
                "StringValue": "ko"     // 한국어
              }
            },
          }
        ]
      }
    }

    const queryCommand = new QueryCommand(input);

    try {
      // Kendra 검색
      const queryRes = await kendra.client.send(queryCommand);

      return queryRes;
    } catch (err) {
      console.log(err);

      return false;
    }
  },

  /**
   * [ 검색 로직 ]
   * @param {*} queryText : 사용자 검색 키워드
   */
  search: async (queryText) => {
    const queryRes = await kendra.getQueryCommand(queryText);

    if (!queryRes) {
      console.log("err or empty res")
      return false;
    }

    // 데모 버전으로 페이징 미구현
    // page.currentPage
    // page.lastPage
    // page.scrollChecker

    const searchResultContainer = document.querySelector('.search-result-container');
    searchResultContainer.innerHTML = '';

    queryRes.ResultItems.forEach((item) => {
      const document = components.getDocument(item);
      searchResultContainer.appendChild(document);
    });
  }
}

const controller = {
  /**
   * [ 컨트롤러 이벤트 묶음 ]
   */
  setEvents: () => {
    controller.searchEvent();
    controller.optionBtnEvent();
    controller.dateModalBtnEvent();
    controller.dateBtnEvent();
    controller.optionScrollEvent();
  },

  /**
   * [ 검색 이벤트 (클릭 / 엔터) ]
   */
  searchEvent: () => {
    const searchBtn = document.querySelector('#searchBtn');
    const queryText = document.querySelector('#queryText');

    searchBtn.addEventListener('click', () => { kendra.search(queryText.value); });
    queryText.addEventListener('keydown', (e) => {
      if (e.keyCode == 13) { kendra.search(queryText.value); }
    });
  },

  /**
   * [ AND / OR / NOT Option 클릭 이벤트 ]
   */
  optionBtnEvent: () => {
    const andBtn = document.querySelector('#andBtn');
    const orBtn = document.querySelector('#orBtn');
    const notBtn = document.querySelector('#notBtn');

    andBtn.addEventListener('click', () => {
      const queryText = document.querySelector('#queryText');
      if (queryText.value === '') { return; }
      const tagsContainer = document.querySelector('.tags-container');
      const tag = document.createElement('button');
      tag.classList.add('tag-btn');
      tag.classList.add('NON');
      tag.setAttribute('option', 'AND');
      tag.setAttribute('value', queryText.value);
      tag.textContent = '+ AND : ' + queryText.value;
      tag.addEventListener('click', () => { tag.remove(); });
      queryText.value = '';
      tagsContainer.appendChild(tag);
    });

    orBtn.addEventListener('click', () => {
      const queryText = document.querySelector('#queryText');
      if (queryText.value === '') { return; }
      const tagsContainer = document.querySelector('.tags-container');
      const tag = document.createElement('button');
      tag.classList.add('tag-btn');
      tag.classList.add('NON');
      tag.setAttribute('option', 'OR');
      tag.setAttribute('value', queryText.value);
      tag.textContent = '+ OR : ' + queryText.value;
      tag.addEventListener('click', () => { tag.remove(); });
      queryText.value = '';
      tagsContainer.appendChild(tag);
    });

    notBtn.addEventListener('click', () => {
      const queryText = document.querySelector('#queryText');
      if (queryText.value === '') { return; }
      const tagsContainer = document.querySelector('.tags-container');
      const tag = document.createElement('button');
      tag.classList.add('tag-btn');
      tag.classList.add('NON');
      tag.setAttribute('option', 'NOT');
      tag.setAttribute('value', queryText.value);
      tag.textContent = '+ NOT : ' + queryText.value;
      tag.addEventListener('click', () => { tag.remove(); });
      queryText.value = '';
      tagsContainer.appendChild(tag);
    });
  },

  /**
   * [ DATE Modal 클릭 이벤트 ]
   *  - 모달 컨트롤(열기, 닫기) 관련 이벤트
   */
  dateModalBtnEvent: () => {
    const dateBtn = document.querySelector('#dateBtn');
    const exitBtn = document.querySelector('#exitBtn');
    const background = document.querySelector('.background-container');
    const dateContainer = document.querySelector('.search-date-option-container');

    dateBtn.addEventListener('click', () => {
      dateContainer.style.display = 'flex';
      background.style.display = 'block';
    });

    exitBtn.addEventListener('click', () => {
      dateContainer.style.display = 'none';
      background.style.display = 'none';
    });

    background.addEventListener('click', () => {
      dateContainer.style.display = 'none';
      background.style.display = 'none';
    });
  },

  /**
   * [ DATE Option 클릭 이벤트 ]
   */
  dateBtnEvent: () => {
    const proAfterBtn = document.querySelector('#proAfterBtn');
    const proBeforeBtn = document.querySelector('#proBeforeBtn');
    const updAfterBtn = document.querySelector('#updAfterBtn');
    const updBeforeBtn = document.querySelector('#updBeforeBtn');

    proAfterBtn.addEventListener('click', () => {
      const processedDate = document.querySelector('#processedDate');
      if (processedDate.value === '') { return; }

      const tagsContainer = document.querySelector('.tags-container');
      const tag = document.createElement('button');
      tag.classList.add('date-tag-btn');
      tag.classList.add('NON');
      tag.setAttribute('option', 'AND _processed_date:>=');
      tag.setAttribute('value', processedDate.value);
      tag.textContent = '+ PROCESSED >= : ' + processedDate.value;
      tag.addEventListener('click', () => { tag.remove(); });
      tagsContainer.appendChild(tag);
    });

    proBeforeBtn.addEventListener('click', () => {
      const processedDate = document.querySelector('#processedDate');
      if (processedDate.value === '') { return; }

      const tagsContainer = document.querySelector('.tags-container');
      const tag = document.createElement('button');
      tag.classList.add('date-tag-btn');
      tag.classList.add('NON');
      tag.setAttribute('option', 'AND _processed_date:<=');
      tag.setAttribute('value', processedDate.value);
      tag.textContent = '+ PROCESSED <= : ' + processedDate.value;
      tag.addEventListener('click', () => { tag.remove(); });
      tagsContainer.appendChild(tag);
    });

    updAfterBtn.addEventListener('click', () => {
      const updatedDate = document.querySelector('#updatedDate');
      if (updatedDate.value === '') { return; }

      const tagsContainer = document.querySelector('.tags-container');
      const tag = document.createElement('button');
      tag.classList.add('date-tag-btn');
      tag.classList.add('NON');
      tag.setAttribute('option', 'AND _last_updated_at:>=');
      tag.setAttribute('value', updatedDate.value);
      tag.textContent = '+ UPDDATED >= : ' + updatedDate.value;
      tag.addEventListener('click', () => { tag.remove(); });
      tagsContainer.appendChild(tag);
    });

    updBeforeBtn.addEventListener('click', () => {
      const updatedDate = document.querySelector('#updatedDate');
      if (updatedDate.value === '') { return; }

      const tagsContainer = document.querySelector('.tags-container');
      const tag = document.createElement('button');
      tag.classList.add('date-tag-btn');
      tag.classList.add('NON');
      tag.setAttribute('option', 'AND _last_updated_at:<=');
      tag.setAttribute('value', updatedDate.value);
      tag.textContent = '+ UPDDATED <= : ' + updatedDate.value;
      tag.addEventListener('click', () => { tag.remove(); });
      tagsContainer.appendChild(tag);
    });
  },

  /**
   * [ 태그 스크롤 이벤트 ]
   */
  optionScrollEvent: () => {
    const optionContainer = document.querySelector('.tags-container');

    // 뱃지가 표출되는 범위를 벗어나는 경우, 해당 DIV 내에서 스크롤을 좌, 우 스크롤로 변경
    optionContainer.addEventListener('wheel', function (e) {
      e.preventDefault();
      optionContainer.scrollLeft += e.deltaY;
    });
  }
}

const util = {
    removeOperator: (query) => {
      if (query.startsWith(" AND")) { return query.substring(4); }
      else if (query.startsWith(" OR")) { return query.substring(3); }
      else if (query.startsWith(" NOT")) { return query.substring(4); }
      return query;
    },
  }

document.addEventListener("DOMContentLoaded", function () {
    kendra.init();
    controller.setEvents();
  });