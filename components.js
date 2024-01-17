const components = {
  getDocument: (item) => {
    let titleText = item.DocumentTitle.Text;                    // 문서 타이틀
    const titleHighlights = item.DocumentTitle.Highlights;      // 문서 타이틀 주요 단어

    if(titleHighlights.length > 0) {
      [...titleHighlights].reverse().forEach((highlight) => {
        titleText = titleText.substring(0, highlight.EndOffset) + '</lable>' + titleText.substring(highlight.EndOffset);

        titleText = titleText.substring(0, highlight.BeginOffset) + '<lable class="highlight">' + titleText.substring(highlight.BeginOffset);
      });
    }

    let exceptText = item.DocumentExcerpt.Text;                   // 문서의 텍스트를 추출
    const exceptHighlights = item.DocumentExcerpt.Highlights;     // 추출 텍스트 중 주요 단어

    if(exceptHighlights.length > 0) {
      [...exceptHighlights].reverse().forEach((highlight) => {
        exceptText = exceptText.substring(0, highlight.EndOffset) + '</lable>' + exceptText.substring(highlight.EndOffset);

        exceptText = exceptText.substring(0, highlight.BeginOffset) + '<lable class="highlight">' + exceptText.substring(highlight.BeginOffset);
      });
    }

    const documentContainer = document.createElement('div');
    documentContainer.classList.add('document-container');

    const documentTitleContainer = document.createElement('div');
    documentTitleContainer.classList.add('document-title-container');

    const documentTitle = document.createElement('label');
    documentTitle.classList.add('document-title');
    documentTitle.innerHTML = titleText;

    const badgeList = document.createElement('div');
    badgeList.classList.add('badge-list');

    const linkBadge = document.createElement('div');
    linkBadge.classList.add('badge');
    linkBadge.classList.add('STANDARD');

    const link = document.createElement('a');
    link.href = item.DocumentURI;
    link.target = "_blank";
    link.className = "link";
    link.textContent = "LINK";

    const scoreBadge = document.createElement('div');
    scoreBadge.classList.add('badge');
    scoreBadge.classList.add(item.ScoreAttributes.ScoreConfidence);
    scoreBadge.innerText = item.ScoreAttributes.ScoreConfidence;

    linkBadge.appendChild(link);
    badgeList.appendChild(linkBadge);
    badgeList.appendChild(scoreBadge);
    documentTitleContainer.appendChild(documentTitle);
    documentTitleContainer.appendChild(badgeList);

    const documentBodyContainer = document.createElement('div');
    documentBodyContainer.classList.add('document-body-container');
    documentBodyContainer.classList.add('document-body');
    documentBodyContainer.innerHTML = exceptText;

    documentContainer.appendChild(documentTitleContainer);
    documentContainer.appendChild(documentBodyContainer);

    return documentContainer;
  }
}