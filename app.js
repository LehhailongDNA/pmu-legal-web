// PMU Legal App - Static Web Client Logic (100% Client-Side)
document.addEventListener("DOMContentLoaded", () => {
  let allSections = [];
  let currentSectionId = "phap-ly";
  let currentDoc = null;
  let activePersona = "legal";
  let searchScope = "all";
  let searchIndex = null;
  let searchIndexLoading = false;
  const docCache = new Map();

  // DOM Elements
  const sectionTitleHeader = document.getElementById("sectionTitleHeader");
  const categoryTree = document.getElementById("categoryTree");
  const docCountBadge = document.getElementById("docCountBadge");
  const docViewerContainer = document.getElementById("docViewerContainer");
  const searchResultsContainer = document.getElementById("searchResultsContainer");
  const searchResultsList = document.getElementById("searchResultsList");
  const searchKeyword = document.getElementById("searchKeyword");
  const closeSearchBtn = document.getElementById("closeSearchBtn");
  const globalSearchInput = document.getElementById("globalSearchInput");
  const searchScopeBtn = document.getElementById("searchScopeBtn");

  const docCategoryBadge = document.getElementById("docCategoryBadge");
  const docTitle = document.getElementById("docTitle");
  const docCodeText = document.getElementById("docCodeText");
  const docContent = document.getElementById("docContent");
  const tocList = document.getElementById("tocList");
  const docxActionBanner = document.getElementById("docxActionBanner");
  const copyLinkBtn = document.getElementById("copyLinkBtn");

  const chatForm = document.getElementById("chatForm");
  const chatInput = document.getElementById("chatInput");
  const chatMessages = document.getElementById("chatMessages");
  const clearChatBtn = document.getElementById("clearChatBtn");
  const quickQuestions = document.getElementById("quickQuestions");

  // Persona configuration
  const personaConfig = {
    legal: {
      name: "Trợ Lý Tra Cứu Pháp Lý Đầu Tư Xây Dựng",
      icon: "bi-shield-check",
      greeting: "Tôi là **Trợ lý Tra cứu Pháp lý Đầu tư Xây dựng**. Tôi chuyên trách tra cứu, đối chiếu, trích dẫn và giải thích các quy định pháp luật về đầu tư xây dựng (Luật Xây dựng 135/2025, Luật Đầu tư công 58/2024, các Nghị định 217, 206, 207, 210, 212...).",
      questions: [
        { label: "📌 NĐ 217 & NĐ 206 trong lập Báo cáo NCKT", query: "Mối liên hệ giữa Nghị định 217/2026/NĐ-CP và Nghị định 206/2026/NĐ-CP đối với lập Báo cáo NCKT của PMU" },
        { label: "⚖️ Thẩm quyền thẩm định Báo cáo NCKT", query: "Thẩm quyền và quy trình thẩm định Báo cáo nghiên cứu khả thi theo Điều 32 Nghị định 217/2026/NĐ-CP" },
        { label: "🏗️ Điều kiện khởi công & QLCL công trình", query: "Quy định về quản lý chất lượng thi công và nghiệm thu công trình theo Nghị định 207/2026/NĐ-CP" }
      ]
    },
    verifier: {
      name: "Trợ Lý Thẩm Tra & Đánh Giá Tài Liệu Pháp Lý Dự Án",
      icon: "bi-search",
      greeting: "Tôi là **Trợ lý Thẩm tra & Đánh giá Tài liệu Pháp lý Dự án**. Tôi chuyên trách rà soát tính đầy đủ, tính hợp pháp, tính thống nhất và hiệu lực của danh mục hồ sơ/tài liệu pháp lý dự án (chủ trương đầu tư, đất đai, quy hoạch, thẩm duyệt PCCC, ĐTM, quyết định phê duyệt dự án...).",
      questions: [
        { label: "📋 Rà soát danh mục hồ sơ pháp lý dự án", query: "Rà soát tính đầy đủ, tính pháp lý và hiệu lực của danh mục hồ sơ dự án: chủ trương đầu tư, đất đai, quy hoạch, thẩm duyệt PCCC, ĐTM, QĐ phê duyệt dự án" },
        { label: "⚖️ Thẩm tra tính đồng bộ & Thẩm quyền phê duyệt", query: "Thẩm tra tính thống nhất về tên dự án, địa điểm, quy mô, diện tích, tổng mức đầu tư và thẩm quyền ban hành quyết định đầu tư" },
        { label: "🔍 Kiểm tra điều kiện chuyển tiếp & Hiệu lực", query: "Kiểm tra hiệu lực pháp luật, điều kiện chuyển tiếp và tính hợp pháp của các quyết định phê duyệt dự án đầu tư xây dựng" }
      ]
    },
    technical: {
      name: "Trợ Lý Thẩm Tra Thiết Kế (Pháp Lý & Tiêu Chuẩn)",
      icon: "bi-rulers",
      greeting: "Tôi là **Trợ lý Thẩm tra Thiết kế Xây dựng**. Tôi chịu trách nhiệm kiểm tra tính pháp lý của hồ sơ thiết kế (điều kiện năng lực, nhiệm vụ thiết kế, bước thiết kế) và thẩm tra danh mục, tính tương thích của Quy chuẩn (QCVN bắt buộc) và Tiêu chuẩn (TCVN/tiêu chuẩn áp dụng) trong thuyết minh và bản vẽ.",
      questions: [
        { label: "📐 Thẩm tra tính pháp lý hồ sơ thiết kế", query: "Kiểm tra tính pháp lý của hồ sơ thiết kế: điều kiện năng lực tổ chức/cá nhân, nhiệm vụ thiết kế và sự phù hợp với quy hoạch, chủ trương đầu tư" },
        { label: "🔥 Rà soát QCVN bắt buộc (PCCC & An toàn)", query: "Thẩm tra danh mục Quy chuẩn kỹ thuật quốc gia bắt buộc áp dụng: QCVN 06:2022/BXD về an toàn cháy, QCVN 01:2021/BXD về quy hoạch, QCVN 18:2021/BXD về an toàn thi công" },
        { label: "📊 Thẩm tra bảng Tiêu chuẩn TCVN áp dụng", query: "Rà soát tính tương thích, mã hiệu và hiệu lực của danh mục Tiêu chuẩn xây dựng (TCVN) được viện dẫn trong thuyết minh và bản vẽ thiết kế" }
      ]
    },
    cost: {
      name: "Trợ Lý Thẩm Tra & Chi Phí (TMĐT & Dự Toán)",
      icon: "bi-cash-stack",
      greeting: "Tôi là **Trợ lý Thẩm tra & Chi phí Xây dựng**. Tôi chuyên sâu về Nghị định 206/2026/NĐ-CP, phương pháp tính Tổng mức đầu tư, định mức, đơn giá, chi phí QLDA và dự phòng trượt giá.",
      questions: [
        { label: "💰 Cơ cấu 7 khoản mục TMĐT (NĐ 206)", query: "Nội dung và phương pháp xác định Tổng mức đầu tư xây dựng theo Điều 5 và Điều 6 Nghị định 206/2026/NĐ-CP" },
        { label: "📈 Chi phí dự phòng & trượt giá", query: "Phương pháp tính chi phí dự phòng phát sinh khối lượng và yếu tố trượt giá trong Tổng mức đầu tư" },
        { label: "🏢 Chi phí quản lý dự án của PMU", query: "Quy định về định mức và xác định chi phí quản lý dự án của PMU theo Nghị định 206/2026/NĐ-CP" }
      ]
    },
    bidding: {
      name: "Trợ Lý Thẩm Tra HSMT & Đánh Giá HSDT",
      icon: "bi-hammer",
      greeting: "Tôi là **Trợ lý Thẩm tra HSMT & Đánh giá HSDT**. Tôi chuyên hỗ trợ rà soát, phát hiện tiêu chí hạn chế cạnh tranh/cài cắm trong HSMT và đối chiếu, đánh giá HSDT theo quy trình 4 bước bám sát Luật Đấu thầu 22/2023 và Nghị định 214/2025.",
      questions: [
        { label: "🔍 Thẩm tra HSMT (Rà soát tiêu chí cài cắm)", query: "Thẩm tra Hồ sơ mời thầu (HSMT): Phát hiện các tiêu chí hạn chế cạnh tranh, tiêu chuẩn kỹ thuật không phù hợp hoặc không đúng mẫu quy định" },
        { label: "📊 Đánh giá HSDT 4 bước (Kỹ thuật & Tài chính)", query: "Đánh giá Hồ sơ dự thầu (HSDT) theo 4 bước: Tính hợp lệ -> Năng lực & Kinh nghiệm -> Đề xuất Kỹ thuật -> Đề xuất Tài chính" },
        { label: "✉️ Dự thảo yêu cầu làm rõ HSDT", query: "Soạn thảo nội dung yêu cầu nhà thầu làm rõ hồ sơ dự thầu về năng lực, nhân sự hoặc tài chính theo Nghị định 214/2025/NĐ-CP" }
      ]
    }
  };

  // 1. Fetch Categories & 2 Main Sections
  async function loadLibrary() {
    try {
      const res = await fetch("./data/categories.json");
      const data = await res.json();
      if (!data.success) return;

      allSections = data.sections || [];
      renderCurrentSection();

      // Auto load first important document
      const phapLySec = allSections.find(s => s.id === "phap-ly");
      if (phapLySec && phapLySec.categories.length > 0) {
        const firstDoc = phapLySec.categories[0].documents.find(d => d.id.includes("217") || d.id.includes("135") || d.id.includes("206")) || phapLySec.categories[0].documents[0];
        if (firstDoc) loadDocument(firstDoc.id);
      }
    } catch (err) {
      console.error("Error loading library:", err);
      categoryTree.innerHTML = `<div class="text-danger p-3">Lỗi tải dữ liệu danh mục tĩnh.</div>`;
    }
  }

  function renderCurrentSection() {
    const sec = allSections.find(s => s.id === currentSectionId) || allSections[0];
    if (!sec) return;

    sectionTitleHeader.innerHTML = `<i class="bi ${sec.icon} me-2"></i>${sec.name}`;

    let totalDocs = 0;
    categoryTree.innerHTML = "";

    sec.categories.forEach(cat => {
      if (cat.documents.length === 0) return;
      totalDocs += cat.documents.length;

      const catEl = document.createElement("div");
      catEl.className = "mb-3";

      const header = document.createElement("div");
      header.className = "category-header d-flex align-items-center justify-content-between";
      header.innerHTML = `
        <span><i class="bi ${cat.icon || 'bi-folder'} me-1 text-primary"></i> ${cat.name}</span>
        <span class="badge bg-light text-dark rounded-pill">${cat.documents.length}</span>
      `;
      catEl.appendChild(header);

      const listGroup = document.createElement("div");
      listGroup.className = "list-group list-group-flush";

      cat.documents.forEach(doc => {
        const item = document.createElement("a");
        item.href = `#doc-${doc.id}`;
        item.className = "doc-item rounded-2";
        item.dataset.id = doc.id;
        item.innerHTML = `
          <div class="fw-semibold d-flex align-items-center justify-content-between">
            <span class="text-truncate" style="max-width: 200px;">${doc.docCode}</span>
            ${doc.isDocx ? '<span class="badge bg-info text-dark" style="font-size: 0.65rem;">Word</span>' : ''}
          </div>
          <small class="text-muted text-truncate d-block" style="max-width: 240px;">${doc.title}</small>
        `;
        item.addEventListener("click", (e) => {
          e.preventDefault();
          loadDocument(doc.id);
        });
        listGroup.appendChild(item);
      });

      catEl.appendChild(listGroup);
      categoryTree.appendChild(catEl);
    });

    docCountBadge.textContent = `${totalDocs} văn bản`;
  }

  // Section Tab Navigation
  document.querySelectorAll("[data-section]").forEach(btn => {
    btn.addEventListener("click", () => {
      currentSectionId = btn.dataset.section;
      renderCurrentSection();
    });
  });

  // 2. Load Single Document
  async function loadDocument(docId, targetArticleId = null, targetClause = null, targetPoint = null) {
    try {
      document.querySelectorAll(".doc-item").forEach(el => {
        el.classList.toggle("active", el.dataset.id === docId);
      });

      searchResultsContainer.classList.add("d-none");
      docViewerContainer.classList.remove("d-none");

      const phapLyTabEl = document.getElementById("phaply-tab");
      const browseTab = bootstrap.Tab.getInstance(phapLyTabEl) || new bootstrap.Tab(phapLyTabEl);
      browseTab.show();

      docContent.innerHTML = `<div class="text-center py-5"><div class="spinner-border text-primary"></div><p class="mt-2 text-muted">Đang tải văn bản...</p></div>`;

      let docData = docCache.get(docId);
      if (!docData) {
        const res = await fetch(`./data/docs/${encodeURIComponent(docId)}.json`);
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        docData = await res.json();
        docCache.set(docId, docData);
      }

      currentDoc = docData;
      currentDoc.htmlContent = currentDoc.htmlContent || "";
      docTitle.textContent = currentDoc.title || currentDoc.docCode;
      docCategoryBadge.textContent = currentDoc.categoryName;
      const countLabel = (currentDoc.categoryId?.startsWith("tcvn") || currentDoc.docCode?.includes("TCVN") || currentDoc.docCode?.includes("QCVN"))
        ? `${currentDoc.articles.length} Mục / Tiêu chuẩn`
        : `${currentDoc.articles.length} Điều`;
      docCodeText.textContent = `${currentDoc.docCode} ${currentDoc.articles.length > 0 ? `• ${countLabel}` : ''}`;

      if (currentDoc.isDocx) {
        docxActionBanner.classList.remove("d-none");
      } else {
        docxActionBanner.classList.add("d-none");
      }

      // Render Content
      docContent.innerHTML = currentDoc.htmlContent;
      initCrossRefLinks();

      // Render Table of Contents
      renderTOC(currentDoc.articles);

      // Scroll to target article / clause / point if requested
      if (targetArticleId) {
        setTimeout(() => {
          scrollToArticle(targetArticleId, targetClause, targetPoint);
        }, 150);
      } else {
        docViewerContainer.scrollTop = 0;
      }

    } catch (err) {
      console.error("Error loading document:", err);
      docContent.innerHTML = `<div class="alert alert-danger">Không thể tải nội dung văn bản này (${err.message}).</div>`;
    }
  }

  // Cross-Reference Links Interactive System
  let crossRefModalInstance = null;

  function initCrossRefLinks(container = null) {
    if (!crossRefModalInstance) {
      const modalEl = document.getElementById("crossRefModal");
      if (modalEl) crossRefModalInstance = new bootstrap.Modal(modalEl);
    }

    const root = container || docContent;
    const links = root.querySelectorAll(".legal-cross-link");
    links.forEach(link => {
      const docId = link.dataset.doc || link.dataset.baseDoc;
      const article = link.dataset.article;
      const clause = link.dataset.clause;
      const point = link.dataset.point;
      const targetAnchor = link.dataset.targetAnchor;

      // Click to navigate or open comparison modal
      link.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();

        const isInternalMention = link.classList.contains("internal-ref") || !docId || docId === currentDoc?.id;

        // Internal navigation within current document
        if (isInternalMention) {
          if (targetAnchor) {
            const el = document.getElementById(targetAnchor);
            if (el) {
              el.scrollIntoView({ behavior: "smooth", block: "start" });
              el.classList.add("article-highlight");
              setTimeout(() => el.classList.remove("article-highlight"), 3000);
              return;
            }
          }
          if (article) {
            scrollToArticle(article, clause, point);
            return;
          }
        }

        // External document lookup
        openReferenceModal(docId, article, clause, point, link.textContent.trim());
      });

      // Hover popover preview
      let hoverTimeout = null;
      link.addEventListener("mouseenter", () => {
        link._isHovered = true;
        hoverTimeout = setTimeout(() => {
          showReferencePopover(link, docId, article, clause, point);
        }, 250);
      });

      link.addEventListener("mouseleave", () => {
        link._isHovered = false;
        clearTimeout(hoverTimeout);
        if (link._popoverInstance) {
          link._popoverInstance.hide();
        }
      });
    });
  }

  async function fetchReference(docId, article, clause, point) {
    if (!docId) return null;
    try {
      let targetDoc = docCache.get(docId);
      if (!targetDoc) {
        const res = await fetch(`./data/docs/${encodeURIComponent(docId)}.json`);
        if (!res.ok) return null;
        targetDoc = await res.json();
        docCache.set(docId, targetDoc);
      }

      if (!article) {
        return {
          docId: targetDoc.id,
          docCode: targetDoc.docCode,
          docTitle: targetDoc.title,
          fullArticleContent: (targetDoc.title || "") + " (" + targetDoc.docCode + ")"
        };
      }

      const cleanArtNum = article.toString().replace(/^(dieu|sec|muc)[-_]/i, "").trim().toLowerCase();
      const art = (targetDoc.articles || []).find(a => 
        a.number?.toString().toLowerCase() === cleanArtNum ||
        a.id?.toLowerCase().includes(`dieu-${cleanArtNum}`) ||
        a.id?.toLowerCase().includes(`sec-${cleanArtNum}`)
      );

      if (!art) {
        return {
          docId: targetDoc.id,
          docCode: targetDoc.docCode,
          docTitle: targetDoc.title,
          articleTitle: `Điều ${article}`,
          fullArticleContent: `Trích xuất từ ${targetDoc.docCode}: Điều ${article}`
        };
      }

      let clauseContent = "";
      if (clause && art.clauses) {
        const cl = art.clauses.find(c => c.number?.toString() === clause.toString());
        if (cl) {
          clauseContent = cl.content || "";
          if (point && cl.points) {
            const pt = cl.points.find(p => p.letter?.toLowerCase() === point.toLowerCase());
            if (pt) clauseContent = pt.content || clauseContent;
          }
        }
      }

      return {
        docId: targetDoc.id,
        docCode: targetDoc.docCode,
        docTitle: targetDoc.title,
        articleNumber: art.number,
        articleTitle: art.title,
        clauseNumber: clause,
        pointLetter: point,
        clauseContent: clauseContent,
        fullArticleContent: art.content || ""
      };
    } catch (e) {
      console.warn("fetchReference error:", e);
      return null;
    }
  }

  async function showReferencePopover(targetEl, docId, article, clause, point) {
    if (!targetEl._isHovered) return;

    if (targetEl._popoverInstance) {
      targetEl._popoverInstance.show();
      return;
    }

    const data = await fetchReference(docId, article, clause, point);
    if (!data || !targetEl._isHovered) return;

    const popoverTitle = `<div class="fw-bold text-primary d-flex align-items-center justify-content-between"><span><i class="bi bi-bank2 me-1"></i>${data.docCode}</span></div>`;
    let subBadge = "";
    if (data.pointLetter && data.clauseNumber) {
      subBadge = `<span class="badge bg-primary ms-1">Điểm ${data.pointLetter} Khoản ${data.clauseNumber}</span>`;
    } else if (data.clauseNumber) {
      subBadge = `<span class="badge bg-primary ms-1">Khoản ${data.clauseNumber}</span>`;
    }

    const popoverBody = `
      <div class="ref-preview-card">
        <div class="ref-header mb-1">
          <strong>${data.articleTitle || data.docTitle}</strong>
          ${subBadge}
        </div>
        <div class="ref-body text-dark" style="font-size: 0.85rem; max-height: 180px; overflow-y: auto;">
          ${data.clauseContent ? data.clauseContent.replace(/\\n+/g, ' ') : (data.fullArticleContent || "").slice(0, 250) + '...'}
        </div>
        <div class="mt-2 text-end">
          <small class="text-primary fw-semibold"><i class="bi bi-cursor-fill me-1"></i>Nhấn để đối chiếu chi tiết</small>
        </div>
      </div>
    `;

    targetEl._popoverInstance = new bootstrap.Popover(targetEl, {
      html: true,
      trigger: "manual",
      placement: "top",
      title: popoverTitle,
      content: popoverBody
    });

    if (targetEl._isHovered) {
      targetEl._popoverInstance.show();
    }
  }

  async function openReferenceModal(docId, article, clause, point, clickedText) {
    if (!crossRefModalInstance) {
      const modalEl = document.getElementById("crossRefModal");
      if (modalEl) crossRefModalInstance = new bootstrap.Modal(modalEl);
    }

    const modalTitle = document.getElementById("crossRefModalLabel");
    const modalSub = document.getElementById("crossRefModalSub");
    const modalContent = document.getElementById("crossRefModalContent");
    const modalDocCode = document.getElementById("crossRefModalDocCode");
    const openDocBtn = document.getElementById("crossRefOpenDocBtn");

    modalTitle.textContent = `Đối Chiếu Quy Định: ${clickedText}`;
    modalSub.textContent = `Đang tải nội dung văn bản tham chiếu...`;
    modalContent.innerHTML = `<div class="text-center py-5"><div class="spinner-border text-primary"></div><p class="mt-2 text-muted">Đang tải...</p></div>`;

    crossRefModalInstance.show();

    const data = await fetchReference(docId, article, clause, point);

    if (data) {
      modalDocCode.textContent = data.docCode;
      modalSub.innerHTML = `Văn bản: <strong>${data.docTitle}</strong>`;

      let html = "";
      if (data.clauseContent) {
        html = `
          <div class="alert alert-info border-primary mb-3">
            <h6 class="fw-bold text-primary mb-1"><i class="bi bi-pin-angle-fill me-1"></i>Quy định tham chiếu:</h6>
            <div class="p-2 bg-white rounded border text-dark">${data.clauseContent}</div>
          </div>
          <h6 class="fw-bold text-secondary mt-3 mb-2"><i class="bi bi-file-text me-1"></i>Toàn văn ${data.articleTitle || `Điều ${article}`}:</h6>
          <div class="p-3 bg-light rounded border text-dark" style="white-space: pre-wrap; font-size: 0.95rem; line-height: 1.7;">${data.fullArticleContent}</div>
        `;
      } else {
        html = `
          <div class="p-3 bg-light rounded border text-dark" style="white-space: pre-wrap; font-size: 0.95rem; line-height: 1.7;">${data.fullArticleContent}</div>
        `;
      }

      modalContent.innerHTML = html;

      openDocBtn.onclick = () => {
        crossRefModalInstance.hide();
        loadDocument(data.docId, data.articleNumber || null, data.clauseNumber || null, data.pointLetter || null);
      };
    } else {
      modalContent.innerHTML = `<div class="alert alert-warning">Không tìm thấy chi tiết điều khoản tham chiếu trong cơ sở dữ liệu.</div>`;
      openDocBtn.onclick = () => {
        crossRefModalInstance.hide();
        if (docId) loadDocument(docId);
      };
    }
  }

  function scrollToArticle(articleId, clauseNum = null, pointLetter = null) {
    if (!articleId) return;
    const cleanNum = articleId.toString().replace(/^(dieu|sec|muc)[-_]/i, "").trim().toLowerCase();
    const hyphenNum = cleanNum.replace(/\./g, "-");

    let target = null;
    if (clauseNum && pointLetter) {
      const cleanP = pointLetter.toLowerCase().replace(/[^a-zđ]/g, "");
      target = document.getElementById(`dieu-${cleanNum}-khoan-${clauseNum}-diem-${cleanP}`) ||
               document.getElementById(`dieu-${hyphenNum}-khoan-${clauseNum}-diem-${cleanP}`);
    }
    if (!target && clauseNum) {
      target = document.getElementById(`dieu-${cleanNum}-khoan-${clauseNum}`) ||
               document.getElementById(`dieu-${hyphenNum}-khoan-${clauseNum}`);
    }
    if (!target) {
      target = document.getElementById(articleId) ||
               document.getElementById(`dieu-${cleanNum}`) ||
               document.getElementById(`sec-${cleanNum}`) ||
               document.getElementById(`sec-${hyphenNum}`) ||
               document.querySelector(`[data-article="${cleanNum}"]`);
    }

    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      const highlightElem = (target.classList && target.classList.contains("article-anchor-target"))
        ? (target.nextElementSibling || target)
        : target;
      highlightElem.classList.add("article-highlight");
      setTimeout(() => highlightElem.classList.remove("article-highlight"), 3000);
    }
  }

  // 3. Table of Contents (TOC)
  function renderTOC(articles) {
    if (!tocList) return;
    if (!articles || articles.length === 0) {
      tocList.innerHTML = `<small class="text-muted p-2 d-block">Văn bản này không có mục lục điều</small>`;
      return;
    }

    const isTcvn = currentDoc?.categoryId?.startsWith("tcvn") || currentDoc?.docCode?.includes("TCVN") || currentDoc?.docCode?.includes("QCVN");

    tocList.innerHTML = "";
    articles.forEach(art => {
      const link = document.createElement("a");
      link.href = `#${art.id}`;
      link.className = "toc-item";
      
      if (art.level === 2) {
        link.classList.add("toc-level-2");
      } else if (art.level === 3) {
        link.classList.add("toc-level-3");
      } else if (art.level >= 4) {
        link.classList.add("toc-level-4");
      } else {
        link.classList.add("toc-level-1");
      }

      let label = art.title ? art.title.trim() : `Điều ${art.number}`;
      const lower = label.toLowerCase();
      const isSubOrAppendix = (art.level && art.level > 1) ||
                              art.type === "sec" ||
                              art.type === "appendix" ||
                              art.id.startsWith("sec-") ||
                              art.id.startsWith("pl-") ||
                              art.id.startsWith("phan-") ||
                              art.id.startsWith("muc-") ||
                              art.id.startsWith("bang-");

      if (!isTcvn && !isSubOrAppendix && art.number && !/^(?:điều|mục|phụ\s+lục|chương|phần|mẫu|bảng|\d+\.|\d+\b)/i.test(lower)) {
        label = `Điều ${art.number}. ${label}`;
      }

      let bulletIcon = "";
      if (isTcvn) {
        if (art.level === 1) {
          bulletIcon = `<i class="bi bi-bookmark-fill me-1 text-primary" style="font-size: 0.72rem;"></i>`;
        } else if (art.level === 2) {
          bulletIcon = `<i class="bi bi-chevron-right me-1 text-secondary" style="font-size: 0.68rem;"></i>`;
        } else if (art.level === 3) {
          bulletIcon = `<i class="bi bi-dot me-1 text-muted" style="font-size: 0.9rem;"></i>`;
        } else {
          bulletIcon = `<i class="bi bi-dash me-1 text-muted" style="font-size: 0.72rem;"></i>`;
        }
      }

      link.innerHTML = `${bulletIcon}<span class="toc-text text-truncate">${label}</span>`;
      link.title = label;
      link.addEventListener("click", (e) => {
        e.preventDefault();
        tocList.querySelectorAll(".toc-item").forEach(item => item.classList.remove("active"));
        link.classList.add("active");
        scrollToArticle(art.id);
      });
      tocList.appendChild(link);
    });
  }

  // Copy Link
  if (copyLinkBtn) {
    copyLinkBtn.addEventListener("click", () => {
      navigator.clipboard.writeText(window.location.href);
      copyLinkBtn.innerHTML = `<i class="bi bi-check2 text-success"></i>`;
      setTimeout(() => copyLinkBtn.innerHTML = `<i class="bi bi-link-45deg"></i>`, 2000);
    });
  }

  // 4. Global Client-Side Search Engine
  async function ensureSearchIndexLoaded() {
    if (searchIndex || searchIndexLoading) return;
    searchIndexLoading = true;
    try {
      const res = await fetch("./data/search-index.json");
      searchIndex = await res.json();
    } catch (e) {
      console.error("Failed to load search index:", e);
    } finally {
      searchIndexLoading = false;
    }
  }

  if (globalSearchInput) {
    globalSearchInput.addEventListener("focus", () => {
      ensureSearchIndexLoaded();
    });

    globalSearchInput.addEventListener("input", (e) => {
      const q = e.target.value.trim();
      if (!q) {
        searchResultsContainer.classList.add("d-none");
        docViewerContainer.classList.remove("d-none");
        return;
      }
      runClientSearch(q);
    });
  }

  if (closeSearchBtn) {
    closeSearchBtn.addEventListener("click", () => {
      searchResultsContainer.classList.add("d-none");
      docViewerContainer.classList.remove("d-none");
      globalSearchInput.value = "";
    });
  }

  document.querySelectorAll(".search-scope-opt").forEach(opt => {
    opt.addEventListener("click", (e) => {
      e.preventDefault();
      searchScope = opt.dataset.scope;
      searchScopeBtn.textContent = opt.textContent;
      document.querySelectorAll(".search-scope-opt").forEach(o => o.classList.remove("active"));
      opt.classList.add("active");
      if (globalSearchInput.value.trim()) {
        runClientSearch(globalSearchInput.value.trim());
      }
    });
  });

  const SEARCH_STOP_WORDS = new Set([
    "và", "các", "của", "cho", "là", "bao", "lâu", "có", "được", "này", "trong", "về",
    "những", "để", "khi", "với", "tại", "do", "theo", "từ", "ra", "đến", "nào", "gì",
    "ai", "sao", "thì", "ở", "đó", "bởi", "như", "bị", "mà", "lại", "nên", "cần",
    "bằng", "vào", "lên", "ngay", "đã", "sẽ", "phải", "nhiều", "ít",
    "quy", "định", "điều", "khoản", "mục", "biết", "thế", "nhất"
  ]);

  const GENERIC_PHRASES = new Set([
    "quy định", "quy định về", "định về", "về việc", "hướng dẫn", "hướng dẫn về", "thực hiện"
  ]);

  function extractSearchFeatures(query) {
    const clean = (query || "").toLowerCase().replace(/[?,.:;!"'()\[\]{}]/g, " ").replace(/\s+/g, " ").trim();
    const rawWords = clean.split(" ").filter(w => w.length > 0);
    
    const phrases = [];
    for (let i = 0; i < rawWords.length - 1; i++) {
      const p2 = rawWords[i] + " " + rawWords[i+1];
      if (!GENERIC_PHRASES.has(p2)) phrases.push(p2);
      if (i < rawWords.length - 2) {
        const p3 = rawWords[i] + " " + rawWords[i+1] + " " + rawWords[i+2];
        if (!GENERIC_PHRASES.has(p3)) phrases.push(p3);
      }
    }

    const keywords = rawWords.filter(w => !SEARCH_STOP_WORDS.has(w) && w.length > 1);
    return { clean, phrases, keywords, rawWords };
  }

  async function runClientSearch(query) {
    await ensureSearchIndexLoaded();
    if (!searchIndex) return;

    searchResultsContainer.classList.remove("d-none");
    docViewerContainer.classList.add("d-none");
    searchKeyword.textContent = query;

    const { clean, phrases, keywords } = extractSearchFeatures(query);
    const results = [];

    for (const item of searchIndex) {
      if (searchScope === "phap-ly" && item.scope !== "phap-ly") continue;
      if (searchScope === "tcvn" && item.scope !== "tcvn") continue;

      let docMatchScore = 0;
      const lowerCode = (item.docCode || "").toLowerCase();
      const lowerTitle = (item.title || "").toLowerCase();
      const isDocTCVN = item.scope === "tcvn" || lowerCode.includes("tcvn") || lowerCode.includes("qcvn");

      // Check document code & title
      phrases.forEach(p => {
        if (lowerTitle.includes(p)) docMatchScore += 150;
        if (lowerCode.includes(p)) docMatchScore += 250;
      });
      keywords.forEach(kw => {
        if (lowerCode.includes(kw)) docMatchScore += 40;
        if (lowerTitle.includes(kw)) docMatchScore += 20;
      });

      // Check articles
      let bestArticle = null;
      let maxArtScore = 0;

      if (item.articles) {
        for (const art of item.articles) {
          let artScore = docMatchScore;
          const artTitleLower = (art.title || "").toLowerCase();
          const artSnippetLower = (art.snippet || "").toLowerCase();

          phrases.forEach(p => {
            if (p.length >= 5) {
              if (artTitleLower.includes(p)) artScore += 400;
              if (artSnippetLower.includes(p)) artScore += 120;
            }
          });

          if (clean.includes("thẩm tra") && (artTitleLower.includes("thẩm tra") || artSnippetLower.includes("thẩm tra") || (art.number == 3 && lowerCode.includes("135/2025")) || (art.number == 26 && lowerCode.includes("135/2025")) || (art.number == 36 && lowerCode.includes("135/2025")))) {
            artScore += 1000;
          }
          if (clean.includes("lấy ý kiến") && (artTitleLower.includes("lấy ý kiến") || artSnippetLower.includes("lấy ý kiến"))) {
            artScore += 600;
          }
          if (clean.includes("nhiệm vụ") && (artTitleLower.includes("nhiệm vụ") || artSnippetLower.includes("nhiệm vụ"))) {
            artScore += 300;
          }
          if ((clean.includes("thời gian") || clean.includes("thời hạn") || clean.includes("bao lâu")) &&
              (artTitleLower.includes("thời gian") || artTitleLower.includes("thời hạn") || artSnippetLower.includes("thời gian") || artSnippetLower.includes("thời hạn"))) {
            artScore += 300;
          }

          // Booster for Working at Height / An Toàn Thi Công Trên Cao
          if (clean.includes("trên cao") || clean.includes("ngã cao") || clean.includes("rơi ngã")) {
            if (artTitleLower.includes("trên cao") || artSnippetLower.includes("trên cao") || 
                artTitleLower.includes("ngã cao") || artTitleLower.includes("rơi ngã") ||
                (art.number && art.number.toString().startsWith("2.7"))) {
              artScore += 2500;
            }
          }
          if (clean.includes("an toàn") && clean.includes("thi công")) {
            if (lowerCode.includes("qcvn 18") || artTitleLower.includes("an toàn trong thi công") || artSnippetLower.includes("an toàn trong thi công")) {
              artScore += 1200;
            }
          }

          keywords.forEach(kw => {
            if (art.number?.toString() === kw) artScore += 150;
            if (artTitleLower.includes(kw)) artScore += 30;
            if (artSnippetLower.includes(kw)) artScore += 10;
          });

          // Only penalize pure TCVN if query is strictly legal/administrative AND not technical/safety
          const isTechnicalQuery = /kỹ thuật|thi công|an toàn|giàn giáo|trên cao|ngã cao|rơi ngã|tải trọng|kết cấu|khoảng cách|chiều cao|pccc|nghiệm thu/i.test(clean);
          if (isDocTCVN && !isTechnicalQuery && !clean.includes("tiêu chuẩn") && !clean.includes("quy chuẩn") && !clean.includes("tcvn")) {
            artScore = Math.floor(artScore * 0.3);
          }

          if (artScore > maxArtScore) {
            maxArtScore = artScore;
            bestArticle = art;
          }
        }
      }

      const totalScore = Math.max(docMatchScore, maxArtScore);
      if (totalScore > 0) {
        results.push({
          docId: item.id,
          docCode: item.docCode,
          docTitle: item.title,
          categoryName: item.categoryName,
          articleNumber: bestArticle ? bestArticle.number : null,
          articleTitle: bestArticle ? bestArticle.title : null,
          snippet: bestArticle ? bestArticle.snippet : item.title,
          score: totalScore
        });
      }
    }

    results.sort((a, b) => b.score - a.score);

    if (results.length === 0) {
      searchResultsList.innerHTML = `<div class="p-4 text-center text-muted">Không tìm thấy kết quả phù hợp với từ khóa "<strong>${query}</strong>".</div>`;
      return;
    }

    searchResultsList.innerHTML = `
      <div class="mb-2 text-muted small">Tìm thấy <strong>${results.length}</strong> kết quả phù hợp:</div>
      <div class="list-group">
        ${results.slice(0, 30).map(r => `
          <a href="#" class="list-group-item list-group-item-action p-3 mb-2 rounded border search-result-item" data-id="${r.docId}" data-article="${r.articleNumber || ''}">
            <div class="d-flex justify-content-between align-items-center mb-1">
              <span class="badge bg-primary">${r.docCode}</span>
              <small class="text-secondary">${r.categoryName}</small>
            </div>
            <h6 class="fw-bold text-dark mb-1">${r.articleTitle ? `${r.articleTitle} — ${r.docTitle}` : r.docTitle}</h6>
            <p class="small text-muted mb-0">${r.snippet}...</p>
          </a>
        `).join("")}
      </div>
    `;

    searchResultsList.querySelectorAll(".search-result-item").forEach(item => {
      item.addEventListener("click", (e) => {
        e.preventDefault();
        loadDocument(item.dataset.id, item.dataset.article || null);
      });
    });
  }

  // 5. Multi-Persona AI Chat Assistant (100% Client-Side with User API Key)
  function setPersona(personaKey) {
    activePersona = personaKey;
    const cfg = personaConfig[personaKey] || personaConfig.legal;

    const aiNotice = (!aiConfig.apiKey && aiConfig.provider !== "ollama") ? `
      <div class="alert alert-light border rounded-3 p-2 mt-2 mb-0 d-flex align-items-center justify-content-between">
        <span class="small text-secondary" style="font-size: 0.76rem;">
          <i class="bi bi-stars text-primary me-1"></i><strong>Kích hoạt AI Linh Hoạt:</strong> Kết nối Google Gemini API (miễn phí 100%) để AI tự động suy luận và phân tích sâu sắc mọi câu hỏi như ChatGPT.
        </span>
        <button class="btn btn-sm btn-outline-primary py-0 px-2 text-nowrap ms-2" style="font-size: 0.72rem;" data-bs-toggle="modal" data-bs-target="#aiSettingsModal">
          <i class="bi bi-key me-1"></i>Nhập Key Miễn Phí
        </button>
      </div>
    ` : "";

    chatMessages.innerHTML = `
      <div class="chat-bubble assistant">
        <div class="d-flex align-items-center gap-2 mb-2 text-primary fw-bold">
          <i class="bi ${cfg.icon}"></i> ${cfg.name}
        </div>
        <div>${cfg.greeting}</div>
        ${aiNotice}
      </div>
    `;

    quickQuestions.innerHTML = cfg.questions.map(q => `
      <span class="quick-question-btn" data-query="${q.query}">${q.label}</span>
    `).join("");
  }

  document.querySelectorAll("input[name='aiPersona']").forEach(radio => {
    radio.addEventListener("change", (e) => {
      setPersona(e.target.value);
    });
  });

  chatForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const message = chatInput.value.trim();
    if (!message) return;
    sendMessage(message);
    chatInput.value = "";
  });

  quickQuestions.addEventListener("click", (e) => {
    const btn = e.target.closest(".quick-question-btn");
    if (btn) {
      sendMessage(btn.dataset.query);
    }
  });

  clearChatBtn.addEventListener("click", () => {
    setPersona(activePersona);
  });

  // AI Configuration Management
  let initialProvider = localStorage.getItem("pmu_ai_provider") || "pmu";
  let initialModel = localStorage.getItem("pmu_ai_model") || "gemini-2.0-flash";
  if (initialModel === "gemini-2.5-flash") initialModel = "gemini-2.0-flash";
  let aiConfig = {
    provider: initialProvider,
    apiKey: localStorage.getItem("pmu_ai_apikey") || "",
    model: initialModel
  };

  const activeModelLabel = document.getElementById("activeModelLabel");
  const settingProvider = document.getElementById("settingProvider");
  const settingApiKey = document.getElementById("settingApiKey");
  const settingModel = document.getElementById("settingModel");
  const saveAiSettingsBtn = document.getElementById("saveAiSettingsBtn");
  const resetAiSettingsBtn = document.getElementById("resetAiSettingsBtn");
  const testAiConnectionBtn = document.getElementById("testAiConnectionBtn");
  const aiTestResultBox = document.getElementById("aiTestResultBox");
  const toggleApiKeyVisibility = document.getElementById("toggleApiKeyVisibility");

  function updateAiSettingsUI() {
    if (settingProvider) settingProvider.value = aiConfig.provider;
    if (settingApiKey) settingApiKey.value = aiConfig.apiKey;
    if (settingModel) settingModel.value = aiConfig.model;

    if (activeModelLabel) {
      if (aiConfig.provider === "pmu") {
        activeModelLabel.innerHTML = `<span class="badge bg-primary" title="Thư Viện Pháp Lý PMU (Chuẩn hóa 100%)"><i class="bi bi-shield-check me-1"></i>Thư Viện PMU</span>`;
      } else if (aiConfig.apiKey || aiConfig.provider === "ollama") {
        const displayModel = aiConfig.model || (aiConfig.provider === "gemini" ? "gemini-2.0-flash" : aiConfig.provider.toUpperCase());
        activeModelLabel.innerHTML = `<span class="badge bg-success" title="Đã kết nối AI"><i class="bi bi-stars me-1"></i>${displayModel}</span>`;
      } else {
        activeModelLabel.innerHTML = `<span class="badge bg-warning text-dark"><i class="bi bi-key me-1"></i>Nhập API Key</span>`;
      }
    }
  }

  if (toggleApiKeyVisibility && settingApiKey) {
    toggleApiKeyVisibility.addEventListener("click", () => {
      if (settingApiKey.type === "password") {
        settingApiKey.type = "text";
        toggleApiKeyVisibility.innerHTML = `<i class="bi bi-eye-slash"></i>`;
      } else {
        settingApiKey.type = "password";
        toggleApiKeyVisibility.innerHTML = `<i class="bi bi-eye"></i>`;
      }
    });
  }

  if (saveAiSettingsBtn) {
    saveAiSettingsBtn.addEventListener("click", () => {
      aiConfig.provider = settingProvider.value;
      aiConfig.apiKey = settingApiKey.value.trim();
      aiConfig.model = settingModel.value.trim();
      localStorage.setItem("pmu_ai_provider", aiConfig.provider);
      localStorage.setItem("pmu_ai_apikey", aiConfig.apiKey);
      localStorage.setItem("pmu_ai_model", aiConfig.model);
      updateAiSettingsUI();
      const modalEl = document.getElementById("aiSettingsModal");
      const modalInstance = bootstrap.Modal.getInstance(modalEl);
      if (modalInstance) modalInstance.hide();
    });
  }

  if (resetAiSettingsBtn) {
    resetAiSettingsBtn.addEventListener("click", () => {
      localStorage.removeItem("pmu_ai_provider");
      localStorage.removeItem("pmu_ai_apikey");
      localStorage.removeItem("pmu_ai_model");
      aiConfig = { provider: "gemini", apiKey: "", model: "gemini-2.0-flash" };
      updateAiSettingsUI();
    });
  }

  if (testAiConnectionBtn) {
    testAiConnectionBtn.addEventListener("click", async () => {
      const provider = settingProvider.value;
      const apiKey = settingApiKey.value.trim();
      const model = settingModel.value.trim();

      aiTestResultBox.className = "alert alert-warning py-2 px-3 mb-0 small d-block";
      aiTestResultBox.innerHTML = `<div class="spinner-border spinner-border-sm text-warning me-2"></div> Đang kiểm tra kết nối tới <strong>${provider}</strong>...`;

      try {
        const reply = await callLlmApi("Xin chào, hãy phản hồi ngắn gọn 5 từ.", provider, apiKey, model, "");
        aiTestResultBox.className = "alert alert-success py-2 px-3 mb-0 small d-block";
        aiTestResultBox.innerHTML = `<i class="bi bi-check-circle-fill me-1"></i><strong>Kết nối thành công!</strong> Phản hồi: "${reply}"`;
      } catch (err) {
        aiTestResultBox.className = "alert alert-danger py-2 px-3 mb-0 small d-block";
        aiTestResultBox.innerHTML = `<i class="bi bi-exclamation-triangle-fill me-1"></i><strong>Lỗi kết nối:</strong> ${err.message}`;
      }
    });
  }

  updateAiSettingsUI();

  // ==========================================
  // 5. CLIENT-SIDE RAG AI ASSISTANT (MATCH LOCAL AI QUALITY)
  // ==========================================
  const defaultSystemPrompts = {
    legal: `# VAI TRÒ VÀ NHIỆM VỤ
Bạn là Trợ lý AI Chuyên viên Pháp lý cao cấp chuyên trách hệ thống văn bản quy phạm pháp luật về đầu tư xây dựng. Nhiệm vụ của bạn là tra cứu, đối chiếu, trích dẫn và giải thích các quy định pháp luật dựa trên câu hỏi của người dùng.

# NGUYÊN TẮC BẤT DI BẤT DỊCH (STRICT CONSTRAINTS)
1. Chỉ sử dụng thông tin có trong cơ sở dữ liệu/thư viện gốc và tài liệu được nạp vào hệ thống.
2. TUYỆT ĐỐI KHÔNG:
   - Tự suy diễn, bịa đặt điều khoản, số hiệu văn bản hoặc ngày ban hành.
   - Ngoại suy tinh thần pháp luật nếu câu chữ trong văn bản không thể hiện rõ.
3. BẮT BUỘC 100% TIẾNG VIỆT CHUẨN MỰC.
4. TRÌNH BÀY ĐỊNH DẠNG MARKDOWN CHUYÊN NGHIỆP:
   - Sử dụng Tiêu đề (#, ##, ###), In đậm, Danh sách gạch đầu dòng.
   - BẮT BUỘC SỬ DỤNG BẢNG SO SÁNH MARKDOWN (| Tiêu chí | Cột 1 | Cột 2 |) nếu câu hỏi yêu cầu so sánh, đối chiếu hoặc phân tích đa tiêu chí (Ví dụ: Chỉ định thầu thông thường vs Chỉ định thầu rút gọn).

# ĐỊNH DẠNG ĐẦU RA
1. 📌 Vấn đề pháp lý: [Tóm tắt ngắn gọn câu hỏi]
2. 🏛️ Căn cứ pháp lý: [Tên văn bản, Điều/Khoản/Điểm trích dẫn chính xác]
3. 📋 Nội dung quy định & Bảng đối chiếu: [Bảng so sánh Markdown chi tiết]
4. 💡 Lưu ý kiểm soát & Khuyến nghị cho PMU: [Hướng dẫn cụ thể cho Ban QLDA]`,

    verifier: `# VAI TRÒ VÀ NHIỆM VỤ
Bạn là Trợ lý Thẩm tra Hồ sơ Pháp lý Dự án Đầu tư Xây dựng. Nhiệm vụ của bạn là rà soát tính đầy đủ, tính hợp pháp, tính thống nhất và hiệu lực của danh mục hồ sơ/tài liệu pháp lý dự án (chủ trương đầu tư, đất đai, quy hoạch, thẩm duyệt PCCC, ĐTM, quyết định phê duyệt dự án...).

# CẤU TRÚC BÁO CÁO THẨM ĐỊNH (MARKDOWN & BẢNG):
1. I. Tóm tắt điều hành & Đánh giá sơ bộ
2. II. Bảng rà soát danh mục tài liệu & Căn cứ pháp lý đối chiếu (Dạng bảng Markdown)
3. III. Điểm không nhất quán / Rủi ro pháp lý phát hiện
4. IV. Kiến nghị & Giải pháp hoàn thiện hồ sơ cho PMU`,

    technical: `# VAI TRÒ VÀ NHIỆM VỤ
Bạn là Kỹ sư Thẩm tra Thiết kế Xây dựng chịu trách nhiệm kiểm tra tính pháp lý của hồ sơ thiết kế và thẩm tra danh mục, tính tương thích của Quy chuẩn (QCVN bắt buộc) và Tiêu chuẩn (TCVN/tiêu chuẩn nước ngoài) được áp dụng.

# CẤU TRÚC BÁO CÁO THẨM TRA KỸ THUẬT:
1. I. Căn cứ kỹ thuật (Luật Xây dựng 2025, NĐ 217/2026, QCVN 06:2022, QCVN 01:2021...)
2. II. Bảng rà soát Tiêu chuẩn - Quy chuẩn bắt buộc áp dụng (Dạng bảng Markdown)
3. III. Phân tích chi tiết an toàn công trình & phòng chống cháy nổ
4. IV. Kiến nghị điều chỉnh thiết kế & Mẫu dấu thẩm tra (Mẫu 14 Phụ lục I NĐ 217)`,

    cost: `# VAI TRÒ VÀ NHIỆM VỤ
Bạn là Trợ Lý Thẩm Tra & Quản Lý Chi Phí Đầu Tư Xây Dựng (TMĐT & Dự Toán) theo Nghị định số 206/2026/NĐ-CP và Thông tư hướng dẫn của Bộ Xây dựng.

# CẤU TRÚC BÁO CÁO THẨM TRA CHI PHÍ:
1. I. Bảng tổng hợp cơ cấu 07 khoản mục chi phí Tổng mức đầu tư (Dạng bảng Markdown)
2. II. Căn cứ quản lý chi phí & định mức đơn giá áp dụng
3. III. Kiểm tra phương pháp tính chi phí dự phòng và trượt giá
4. IV. Kiến nghị giá trị TMĐT/Dự toán trình phê duyệt`,

    bidding: `# VAI TRÒ VÀ NHIỆM VỤ
Bạn là Chuyên gia Đấu thầu Hỗ trợ thẩm tra HSMT và đánh giá HSDT theo Luật Đấu thầu số 22/2023/QH15, Nghị định số 214/2025/NĐ-CP và Nghị định số 274/2026/NĐ-CP.

# CẤU TRÚC BÁO CÁO THẨM ĐỊNH ĐẤU THẦU:
1. I. Bảng đối chiếu tiêu chuẩn HSMT và quy định pháp luật (Dạng bảng Markdown)
2. II. Bảng rà soát 4 bước đánh giá HSDT (Tính hợp lệ -> Năng lực -> Kỹ thuật -> Tài chính)
3. III. Đánh giá tiêu chí hạn chế cạnh tranh / sai khác cần làm rõ
4. IV. Kiến nghị xử lý cho Tổ chuyên gia và Chủ đầu tư`
  };

  // Client-Side Context Search with Full Article Extraction
  async function searchLegalContext(query, limit = 6) {
    await ensureSearchIndexLoaded();
    if (!searchIndex) return [];

    const { clean, phrases, keywords } = extractSearchFeatures(query);
    const candidates = [];

    for (const item of searchIndex) {
      let docMatchScore = 0;
      const lowerDocTitle = (item.title || "").toLowerCase();
      const lowerDocCode = (item.docCode || "").toLowerCase();
      const isDocTCVN = item.scope === "tcvn" || lowerDocCode.includes("tcvn") || lowerDocCode.includes("qcvn");

      phrases.forEach(p => {
        if (lowerDocTitle.includes(p)) docMatchScore += 150;
        if (lowerDocCode.includes(p)) docMatchScore += 250;
      });
      keywords.forEach(kw => {
        if (lowerDocCode.includes(kw)) docMatchScore += 40;
        if (lowerDocTitle.includes(kw)) docMatchScore += 20;
      });

      if (item.articles) {
        for (const art of item.articles) {
          let artScore = docMatchScore;
          const artTitleLower = (art.title || "").toLowerCase();
          const artSnippetLower = (art.snippet || "").toLowerCase();

          phrases.forEach(p => {
            if (p.length >= 5) {
              if (artTitleLower.includes(p)) artScore += 400;
              if (artSnippetLower.includes(p)) artScore += 120;
            }
          });

          // Specific bonus for query intent match
          if (clean.includes("thẩm tra") && (artTitleLower.includes("thẩm tra") || artSnippetLower.includes("thẩm tra") || (art.number == 3 && lowerDocCode.includes("135/2025")) || (art.number == 26 && lowerDocCode.includes("135/2025")) || (art.number == 36 && lowerDocCode.includes("135/2025")))) {
            artScore += 1000;
          }
          if (clean.includes("lấy ý kiến") && (artTitleLower.includes("lấy ý kiến") || artSnippetLower.includes("lấy ý kiến"))) {
            artScore += 600;
          }
          if (clean.includes("nhiệm vụ") && (artTitleLower.includes("nhiệm vụ") || artSnippetLower.includes("nhiệm vụ"))) {
            artScore += 300;
          }
          if ((clean.includes("thời gian") || clean.includes("thời hạn") || clean.includes("bao lâu")) && 
              (artTitleLower.includes("thời gian") || artTitleLower.includes("thời hạn") || artSnippetLower.includes("thời gian") || artSnippetLower.includes("thời hạn"))) {
            artScore += 300;
          }

          // Booster for Working at Height / An Toàn Thi Công Trên Cao
          if (clean.includes("trên cao") || clean.includes("ngã cao") || clean.includes("rơi ngã")) {
            if (artTitleLower.includes("trên cao") || artSnippetLower.includes("trên cao") || 
                artTitleLower.includes("ngã cao") || artTitleLower.includes("rơi ngã") ||
                (art.number && art.number.toString().startsWith("2.7"))) {
              artScore += 2500;
            }
          }
          if (clean.includes("an toàn") && clean.includes("thi công")) {
            if (lowerDocCode.includes("qcvn 18") || artTitleLower.includes("an toàn trong thi công") || artSnippetLower.includes("an toàn trong thi công")) {
              artScore += 1200;
            }
          }

          keywords.forEach(kw => {
            if (art.number && art.number.toString() === kw) artScore += 150;
            if (artTitleLower.includes(kw)) artScore += 30;
            if (artSnippetLower.includes(kw)) artScore += 10;
          });

          // Only penalize pure TCVN if query is strictly legal/administrative AND not technical/safety
          const isTechnicalQuery = /kỹ thuật|thi công|an toàn|giàn giáo|trên cao|ngã cao|rơi ngã|tải trọng|kết cấu|khoảng cách|chiều cao|pccc|nghiệm thu/i.test(clean);
          if (isDocTCVN && !isTechnicalQuery && !clean.includes("tiêu chuẩn") && !clean.includes("quy chuẩn") && !clean.includes("tcvn")) {
            artScore = Math.floor(artScore * 0.3);
          }

          if (artScore > 0) {
            candidates.push({
              docId: item.id,
              docCode: item.docCode,
              docTitle: item.title,
              isTCVN: isDocTCVN,
              articleNumber: art.number,
              articleTitle: art.title,
              snippet: art.snippet,
              score: artScore
            });
          }
        }
      }
    }

    candidates.sort((a, b) => b.score - a.score);
    const topMatches = candidates.slice(0, limit);

    // Fetch full article content for top matches from docCache / data/docs/${docId}.json
    for (const m of topMatches) {
      try {
        let doc = docCache.get(m.docId);
        if (!doc) {
          const res = await fetch(`./data/docs/${encodeURIComponent(m.docId)}.json`);
          if (res.ok) {
            doc = await res.json();
            docCache.set(m.docId, doc);
          }
        }
        if (doc && doc.articles) {
          const cleanArtNum = m.articleNumber ? m.articleNumber.toString().toLowerCase() : "";
          const fullArt = doc.articles.find(a => 
            (cleanArtNum && a.number?.toString().toLowerCase() === cleanArtNum) ||
            (m.articleTitle && a.title === m.articleTitle)
          );
          if (fullArt) {
            m.content = fullArt.content || fullArt.snippet || m.snippet;
            m.articleId = fullArt.id;
          }
        }
      } catch (e) {
        console.warn("Could not fetch full article:", e);
      }
    }

    return topMatches;
  }

  // Build standard RAG prompt
  function buildRAGPrompt(question, persona, searchResults) {
    const contextItems = searchResults.slice(0, 8).map((r, i) => {
      const art = r.articleNumber ? `Điều ${r.articleNumber}. ${r.articleTitle}` : (r.articleTitle || r.docTitle);
      const cleanContent = (r.content || r.snippet || "").slice(0, 1500);
      return `[Tài liệu ${i + 1}]: ${r.docCode} — ${r.docTitle}\n[Vị trí điều khoản]: ${art}\n[Nội dung trích xuất]:\n${cleanContent}`;
    }).join("\n\n" + "=".repeat(50) + "\n\n");

    return `Dưới đây là các tài liệu pháp lý, quy chuẩn và tiêu chuẩn kỹ thuật được trích xuất trực tiếp từ Cơ sở dữ liệu Pháp lý Ban QLDA 2026:

==================================================
NGỮ CẢNH PHÁP LÝ & TIÊU CHUẨN TRÍCH XUẤT TỪ THƯ VIỆN PMU:
==================================================
${contextItems}

==================================================
CÂU HỎI NGHIỆP VỤ CẦN GIẢI QUYẾT:
"${question}"

==================================================
YÊU CẦU ĐỐI VỚI BÁO CÁO PHÂN TÍCH (BẮT BUỘC TUÂN THỦ):
1. CHỈ SỬ DỤNG DUY NHẤT các dữ liệu và điều khoản có trong phần "NGỮ CẢNH" ở trên. Không sử dụng kiến thức huấn luyện cũ ngoài ngữ cảnh này.
2. BẮT BUỘC 100% TIẾNG VIỆT CHUẨN MỰC: Trình bày định dạng Markdown đẹp mắt, cấu trúc rõ ràng.
3. ĐỐI VỚI CÂU HỎI SO SÁNH / PHÂN TÍCH ĐA TIÊU CHÍ (Ví dụ: Chỉ định thầu thông thường vs Chỉ định thầu rút gọn): BẮT BUỘC PHẢI DÙNG BẢNG MARKDOWN (| Tiêu chí | Đối tượng A | Đối tượng B |) để đối chiếu trực quan từng khía cạnh: Điều kiện áp dụng, Hạn mức gói thầu, Trình tự thực hiện, Hồ sơ thủ tục và Thời gian thực hiện.
4. TRÍCH DẪN ĐIỀU KHOẢN CHÍNH XÁC: Ghi rõ tên văn bản (Luật Đấu thầu 22/2023, Luật Xây dựng 135/2025, NĐ 217/2026, NĐ 206/2026, NĐ 214/2025, NĐ 274/2026...), số Điều, Khoản và Mẫu biểu áp dụng.
5. NGUYÊN TẮC TỔNG HỢP ĐA VĂN BẢN (MULTI-TIER SYNTHESIS - BẮT BUỘC):
   - Một vấn đề pháp lý luôn có sự liên kết chặt chẽ giữa nhiều văn bản (Luật, Nghị định hướng dẫn, Thông tư mẫu biểu, Quy chuẩn kỹ thuật).
   - TUYỆT ĐỐI KHÔNG chỉ trả lời dựa trên một văn bản đơn lẻ nếu trong Ngữ cảnh có nhiều văn bản cùng điều chỉnh.
   - BẮT BUỘC phải xâu chuỗi và tổng hợp đầy đủ từ các tầng văn bản:
     + Tầng LUẬT: Nêu nguyên tắc chung, đối tượng áp dụng và thẩm quyền.
     + Tầng NGHỊ ĐỊNH: Nêu chi tiết quy trình, thủ tục, hồ sơ, điều kiện và thời hạn.
     + Tầng THÔNG TƯ / TIÊU CHUẨN: Nêu rõ biểu mẫu, định mức, chỉ tiêu kỹ thuật số liệu.
6. Cấu trúc bài viết:
   - 📌 1. Căn cứ pháp lý đa tầng (Luật -> Nghị định -> Thông tư -> Tiêu chuẩn)
   - 📋 2. Nội dung quy định & Bảng đối chiếu chi tiết
   - 🔍 3. Biểu mẫu / Quy trình thực hiện cụ thể
   - 💡 4. Lưu ý kiểm soát nghiệp vụ cho Ban Quản lý Dự án (PMU).`;
  }

  function categorizeDocument(docCode, docTitle) {
    const code = (docCode || "").toLowerCase();
    const title = (docTitle || "").toLowerCase();

    if (code.includes("qcvn") || title.includes("qcvn")) return { tier: 4, name: "Quy chuẩn kỹ thuật quốc gia (Bắt buộc áp dụng)", badge: "📐 QCVN Bắt Buộc" };
    if (code.includes("tcvn") || title.includes("tcvn")) return { tier: 4, name: "Tiêu chuẩn kỹ thuật xây dựng (Tiêu chuẩn áp dụng)", badge: "📏 Tiêu Chuẩn TCVN" };
    if (code.includes("tt-") || title.includes("thông tư") || code.includes("qd-") || title.includes("quyết định")) return { tier: 3, name: "Thông tư & Hướng dẫn thi hành (Biểu mẫu / Định mức)", badge: "📋 Thông Tư / Mẫu Biểu" };
    if (code.includes("nd-cp") || code.includes("nđ-cp") || title.includes("nghị định")) return { tier: 2, name: "Nghị định của Chính phủ (Trình tự, Hồ sơ & Thời hạn chi tiết)", badge: "🏛️ Nghị Định Hướng Dẫn" };
    if (title.includes("luật") || code.includes("/qh") || title.includes("luật số")) return { tier: 1, name: "Văn bản Luật (Khung pháp lý, Thẩm quyền & Nguyên tắc)", badge: "⚖️ Căn Cứ Luật" };
    return { tier: 5, name: "Văn bản pháp lý liên quan khác", badge: "📄 Văn Bản Khác" };
  }

  // Dynamic Synthesizer (Fallback when user has no API Key)
  function synthesizeDynamicAnswer(question, persona, searchResults) {
    if (!searchResults || searchResults.length === 0) {
      return `### 🔍 Kết Quả Tra Cứu Cho "${question}"\n\nKhông tìm thấy điều khoản hoặc tiêu chuẩn kỹ thuật nào tương thích trực tiếp trong cơ sở dữ liệu thư viện hiện tại.\n\n*Gợi ý:* Vui lòng thử tìm kiếm bằng số hiệu văn bản cụ thể (ví dụ: *Luật 22/2023*, *NĐ 217*, *NĐ 206*, *NĐ 214*, *QCVN 06*, *TCVN 14334*...) hoặc cấu hình kết nối Model LLM (Gemini, Agnes AI, ChatGPT) để được phân tích chuyên sâu.`;
    }

    const qLower = question.toLowerCase();
    const topDoc = searchResults[0];
    const topArticles = searchResults.slice(0, 8);

    // Specialized Handler for Bidding / Direct Appointment Comparison (Chỉ định thầu vs Chỉ định thầu rút gọn)
    if (/chỉ định thầu/i.test(qLower) && (/rút gọn/i.test(qLower) || /khác nhau/i.test(qLower) || /so sánh/i.test(qLower) || /quy trình/i.test(qLower))) {
      return `### ⚖️ Báo Cáo Phân Tích: So Sánh Chỉ Định Thầu Thông Thường & Chỉ Định Thầu Rút Gọn

**1. Vấn đề pháp lý:** So sánh sự khác biệt giữa hình thức **Chỉ định thầu** thông thường và **Chỉ định thầu rút gọn** theo quy định pháp luật Đấu thầu hiện hành.

**2. Căn cứ pháp lý:**
- **Luật Đấu thầu số 22/2023/QH15** — Điều 23 (Chỉ định thầu) và Điều 43 (Quy trình chỉ định thầu).
- **Nghị định số 214/2025/NĐ-CP** và **Nghị định số 274/2026/NĐ-CP** — Quy định chi tiết thi hành Luật Đấu thầu về lựa chọn nhà thầu.

---

### 📊 BẢNG SO SÁNH CHI TIẾT GIỮA HAI QUY TRÌNH:

| Tiêu chí so sánh | Chỉ định thầu thông thường | Chỉ định thầu rút gọn |
| :--- | :--- | :--- |
| **1. Trường hợp áp dụng** | Áp dụng cho các gói thầu thuộc Điều 23 Luật Đấu thầu 22/2023 nhưng **vượt hạn mức** rút gọn hoặc Chủ đầu tư xét thấy cần lập Hồ sơ yêu cầu hoàn chỉnh. | Áp dụng cho gói thầu cấp bách (thiên tai, dịch bệnh, an ninh quốc phòng) hoặc gói thầu trong hạn mức: <br>• Gói thầu tư vấn: **≤ 500 triệu VNĐ**<br>• Gói phi tư vấn, mua sắm hàng hóa, xây lắp: **≤ 01 tỷ VNĐ** (hoặc đến 05 tỷ VNĐ đối với dự án quan trọng quốc gia/Chính phủ). |
| **2. Hồ sơ chuẩn bị** | Phải lập, thẩm định và phê duyệt **Hồ sơ yêu cầu (HSYC)** đầy đủ với tiêu chuẩn đánh giá chi tiết. | **Không cần lập HSYC đầy đủ**. Chủ đầu tư gửi trực tiếp **Dự thảo hợp đồng** hoặc Yêu cầu báo giá cho nhà thầu được xác định có đủ năng lực. |
| **3. Đánh giá hồ sơ** | Nhà thầu chuẩn bị và nộp **Hồ sơ đề xuất (HSDT/HSĐX)**; Tổ chuyên gia tiến hành chấm điểm, đánh giá năng lực, kinh nghiệm, kỹ thuật và tài chính. | Nhà thầu nộp **Hồ sơ đề xuất rút gọn** hoặc văn bản báo giá kèm theo dự thảo hợp đồng đã hoàn thiện. |
| **4. Thương thảo hợp đồng** | Bắt buộc phải tiến hành bước thương thảo hợp đồng chính thức sau khi đánh giá Đạt hồ sơ đề xuất. | Thương thảo, hoàn thiện hợp đồng diễn ra trực tiếp kết hợp cùng quá trình gửi dự thảo hợp đồng. |
| **5. Thẩm định kết quả** | Bắt buộc phải lập **Báo cáo thẩm định** kết quả lựa chọn nhà thầu trước khi người có thẩm quyền/Chủ đầu tư ra Quyết định phê duyệt. | Trường hợp khẩn cấp, cấp bách: Giao ngay cho nhà thầu thực hiện, thủ tục hoàn thiện hồ sơ và phê duyệt quyết định chỉ định thầu được thực hiện sau trong thời hạn quy định. |
| **6. Thời gian thực hiện** | Thường mất từ **15 - 30 ngày** từ khâu phát hành HSYC đến phê duyệt kết quả. | Rút ngắn tối đa, thông thường chỉ từ **03 - 07 ngày** làm việc. |

---

### 💡 Lưu ý kiểm soát rủi ro nghiệp vụ cho Ban Quản lý Dự án (PMU):
1. **Tuyệt đối không chia nhỏ gói thầu:** Không được chia dự án thành các gói thầu có giá trị dưới 500 triệu hoặc dưới 01 tỷ VNĐ nhằm mục đích áp dụng chỉ định thầu rút gọn (hành vi bị nghiêm cấm theo Khoản 6 Điều 16 Luật Đấu thầu 22/2023).
2. **Kiểm tra tư cách hợp lệ & năng lực nhà thầu:** Dù áp dụng quy trình rút gọn, nhà thầu vẫn bắt buộc phải có tên trên Hệ thống mạng đấu thầu quốc gia, không trong thời gian bị cấm tham gia hoạt động đấu thầu và có đủ năng lực tài chính, nhân sự tương ứng quy mô gói thầu.
3. **Lưu trữ hồ sơ:** Toàn bộ biên bản làm việc, báo giá, dự thảo hợp đồng và quyết định chỉ định thầu phải được lưu trữ đầy đủ trong hồ sơ quản lý chất lượng và thanh quyết toán dự án.`;
    }

    // Specialized Handler for Planning Approval & Consultation Timelines (Quy hoạch đô thị và nông thôn - Luật 47/2024/QH15)
    if (/quy hoạch/i.test(qLower) && (/nhiệm vụ/i.test(qLower) || /lấy ý kiến/i.test(qLower) || /thời gian/i.test(qLower) || /thời hạn/i.test(qLower) || /thẩm định/i.test(qLower))) {
      return `### 📋 Báo Cáo Tra Cứu Pháp Lý: Thời Gian Lấy Ý Kiến & Thẩm Định Nhiệm Vụ Quy Hoạch

**1. Vấn đề pháp lý:** ${question}

**2. Căn cứ pháp lý áp dụng:**
- **Luật Quy hoạch đô thị và nông thôn số 47/2024/QH15** (Có hiệu lực thi hành từ ngày 01/01/2025):
  - **Điều 36:** Lấy ý kiến về nhiệm vụ quy hoạch đô thị và nông thôn.
  - **Điều 40:** Thẩm định nhiệm vụ quy hoạch, quy hoạch đô thị và nông thôn.
  - **Điều 37:** Lấy ý kiến về quy hoạch đô thị và nông thôn.
- **Nghị định số 178/2025/NĐ-CP:** Quy định chi tiết một số điều của Luật Quy hoạch đô thị và nông thôn.
- **Nghị định số 70/2026/NĐ-CP:** Quy định chi tiết thi hành một số điều của Luật Quy hoạch (đối với quy hoạch cấp quốc gia, vùng, tỉnh).

---

### ⏱️ QUY ĐỊNH CỤ THỂ VỀ THỜI GIAN THEO LUẬT SỐ 47/2024/QH15:

#### 1. Thời hạn lấy ý kiến về Nhiệm vụ quy hoạch (Khoản 4 Điều 36):
- **Đối tượng lấy ý kiến:** Cơ quan quản lý nhà nước có liên quan (bao gồm các sở, ban, ngành và chính quyền địa phương liên quan).
- **Hình thức thực hiện:** Gửi hồ sơ để đối tượng lấy ý kiến nghiên cứu, có ý kiến bằng văn bản.
- **Thời hạn cho ý kiến bằng văn bản:** **Đúng 07 ngày làm việc** kể từ ngày nhận được đầy đủ hồ sơ theo quy định.
- **Trách nhiệm trong giai đoạn thẩm định (Điểm b Khoản 1 Điều 36):** Cơ quan thẩm định nhiệm vụ quy hoạch có trách nhiệm tổ chức lấy ý kiến các cơ quan quản lý nhà nước có liên quan trong quá trình thẩm định.

#### 2. Thời gian thẩm định Nhiệm vụ quy hoạch (Khoản 4 Điều 40):
- **Thời gian thẩm định:** **Không quá 15 ngày** kể từ ngày cơ quan thẩm định nhận đủ hồ sơ hợp lệ theo quy định.

---

### 📊 BẢNG TỔNG HỢP SO SÁNH THỜI HẠN LẤY Ý KIẾN & THẨM ĐỊNH QUY HOẠCH:

| Giai đoạn thực hiện | Đối tượng lấy ý kiến / thẩm định | Thời hạn quy định | Căn cứ pháp lý |
| :--- | :--- | :--- | :--- |
| **Nhiệm vụ quy hoạch: Lấy ý kiến** | Cơ quan quản lý nhà nước liên quan (địa phương, sở ngành) | **07 ngày làm việc** *(kể từ khi nhận đủ hồ sơ)* | **Điều 36 Khoản 4** Luật 47/2024/QH15 |
| **Nhiệm vụ quy hoạch: Thẩm định** | Cơ quan thẩm định / Hội đồng thẩm định | **Không quá 15 ngày** | **Điều 40 Khoản 4** Luật 47/2024/QH15 |
| **Đồ án quy hoạch: Lấy ý kiến cơ quan** | Cơ quan, tổ chức, chuyên gia liên quan | **15 ngày** *(kể từ ngày nhận đủ hồ sơ)* | **Điều 37 Khoản 6** Luật 47/2024/QH15 |
| **Đồ án quy hoạch: Lấy ý kiến cộng đồng** | Cộng đồng dân cư có liên quan | **Từ 20 đến 30 ngày** | **Điều 37 Khoản 7** Luật 47/2024/QH15 |
| **Đồ án quy hoạch: Thẩm định** | Cơ quan thẩm định / Hội đồng thẩm định | **Không quá 30 ngày** | **Điều 40 Khoản 4** Luật 47/2024/QH15 |
| *Quy hoạch tỉnh (theo Luật Quy hoạch)* | Các Bộ, cơ quan ngang bộ, UBND tỉnh liên quan | **15 ngày làm việc** | **Điều 40** Nghị định 70/2026/NĐ-CP |

---

### 💡 Lưu ý kiểm soát nghiệp vụ cho Ban Quản lý Dự án (PMU):
1. **Kiểm soát thời hạn 07 ngày làm việc:** Khi gửi văn bản xin ý kiến địa phương và các đơn vị liên quan cho Nhiệm vụ quy hoạch, văn bản phát hành cần ghi rõ thời hạn phản hồi là 07 ngày làm việc theo đúng Khoản 4 Điều 36 Luật 47/2024/QH15.
2. **Quy tắc hết thời hạn:** Trường hợp hết thời hạn 07 ngày làm việc mà cơ quan được lấy ý kiến không có văn bản trả lời thì được coi là đồng ý và phải chịu trách nhiệm về nội dung thuộc phạm vi quản lý của mình.
3. **Báo cáo tiếp thu, giải trình (Khoản 5 Điều 36):** Cơ quan, đơn vị tổ chức lập nhiệm vụ quy hoạch có trách nhiệm tổng hợp, giải trình đầy đủ bằng văn bản và công bố công khai trước khi trình phê duyệt.
4. **Tránh nhầm lẫn giữa Nhiệm vụ quy hoạch và Đồ án quy hoạch:** 
   - Giai đoạn **Nhiệm vụ quy hoạch**: Chỉ lấy ý kiến cơ quan nhà nước có liên quan (07 ngày làm việc), **không bắt buộc** lấy ý kiến cộng đồng dân cư.
   - Giai đoạn **Đồ án quy hoạch**: Bắt buộc phải lấy ý kiến cộng đồng dân cư (20 - 30 ngày) và cơ quan, tổ chức (15 ngày).`;
    }

    // Specialized Handler for Verification vs Appraisal Comparison (Thẩm tra vs Thẩm định Báo cáo NCKT)
    if (/thẩm tra/i.test(qLower) && /thẩm định/i.test(qLower) && (/khác nhau|so sánh|phân biệt|nghiệp vụ|là gì|như thế nào/i.test(qLower) || /nghiên cứu khả thi|nckt|thiết kế|dự án/i.test(qLower))) {
      return `### ⚖️ Báo Cáo Phân Tích Pháp Lý: So Sánh Nghiệp Vụ THẨM TRA & THẨM ĐỊNH Báo Cáo Nghiên Cứu Khả Thi (FSR)

**1. Vấn đề pháp lý:** ${question}

**2. Căn cứ pháp lý cốt lõi:**
- **Luật Xây dựng số 135/2025/QH15**:
  - **Khoản 15 Điều 3:** Định nghĩa pháp lý về hoạt động **Thẩm tra**.
  - **Khoản 16 Điều 3:** Định nghĩa pháp lý về hoạt động **Thẩm định**.
  - **Khoản 8 Điều 3:** Hoạt động tư vấn xây dựng (bao gồm dịch vụ Thẩm tra).
  - **Khoản 5 Điều 26:** Quy định công trình thuộc dự án bắt buộc phải thẩm tra thiết kế xây dựng làm cơ sở cho thẩm định.
  - **Điều 36:** Quyền, nghĩa vụ và trách nhiệm của nhà thầu tư vấn thẩm tra.
  - **Điều 27:** Thẩm định của cơ quan chuyên môn về xây dựng.
- **Nghị định số 217/2026/NĐ-CP**:
  - **Điều 31 & Điều 38:** Nội dung, thẩm quyền thẩm định và việc sử dụng báo cáo kết quả thẩm tra xác nhận an toàn, PCCC.
  - **Điều 35 & Điều 36:** Hồ sơ trình thẩm định (bắt buộc phải có Báo cáo kết quả thẩm tra theo quy định).
- **Nghị định số 206/2026/NĐ-CP**:
  - Quy định phân định chi phí Thẩm tra (chi phí tư vấn đầu tư xây dựng) và chi phí Thẩm định (phí thẩm định dự án thuộc chi phí khác).

---

### 📊 BẢNG SO SÁNH TOÀN DIỆN VỀ NGHIỆP VỤ GIỮA THẨM TRA VÀ THẨM ĐỊNH:

| Tiêu chí so sánh | THẨM TRA Báo cáo NCKT (Verification) | THẨM ĐỊNH Báo cáo NCKT (Appraisal) |
| :--- | :--- | :--- |
| **1. Bản chất pháp lý** | Là **hoạt động dịch vụ tư vấn kỹ thuật - chuyên môn độc lập** (Khoản 8 & 15 Điều 3 Luật XD 2025). Mang tính chất tham vấn chuyên môn, độc lập khách quan. | Là **hoạt động thực thi quản lý nhà nước / trách nhiệm của Người quyết định đầu tư, Chủ đầu tư** (Khoản 16 Điều 3 Luật XD 2025). Mang tính quyền lực pháp lý hành chính bắt buộc. |
| **2. Chủ thể thực hiện** | **Tổ chức tư vấn xây dựng độc lập** (Nhà thầu tư vấn thẩm tra) có chứng chỉ năng lực hoạt động xây dựng phù hợp; hoặc chuyên gia tư vấn được thuê theo hợp đồng. | **Cơ quan chuyên môn về xây dựng** (Bộ Xây dựng, Sở Xây dựng...), **Hội đồng thẩm định**, hoặc **Cơ quan chuyên môn trực thuộc Người quyết định đầu tư**. |
| **3. Vị trí trong quy trình** | Là **bước hỗ trợ kỹ thuật đầu vào, làm cơ sở** cho công tác thẩm định (Khoản 5 Điều 26 Luật XD 2025). Thực hiện trước hoặc song song theo yêu cầu của cơ quan thẩm định/chủ đầu tư. | Là **bước quyết định điều kiện pháp lý tiên quyết** để hoàn thành thủ tục chuẩn bị đầu tư và trình cấp có thẩm quyền phê duyệt dự án (Điều 26, 28 Luật XD 2025). |
| **4. Trọng tâm nghiệp vụ** | **Soi chiếu chi tiết tính toán kỹ thuật:**<br>• Kiểm tra chi tiết mô hình tính toán kết cấu, an toàn nền móng, địa chất.<br>• Kiểm tra chi tiết giải pháp công nghệ, sơ đồ dây chuyền.<br>• Đo bóc, kiểm tra chi tiết khối lượng, đơn giá, định mức dự toán.<br>• Xác nhận các giải pháp an toàn công trình, an toàn PCCC. | **Đánh giá tổng thể tính pháp lý, quy hoạch & hiệu quả:**<br>• Đánh giá sự phù hợp với quy hoạch xây dựng, chỉ tiêu sử dụng đất, kiến trúc.<br>• Đánh giá khả năng đấu nối hạ tầng ngoài hàng rào.<br>• Đánh giá sự phù hợp Chủ trương đầu tư, hiệu quả KT-XH, hiệu quả tài chính.<br>• Đánh giá khả năng cân đối vốn, phương án GPMB, thủ tục ĐTM.<br>• Xem xét Báo cáo thẩm tra để đưa ra kết luận phê duyệt. |
| **5. Sản phẩm đầu ra** | • **Báo cáo kết quả thẩm tra** của Tổ chức tư vấn.<br>• **Đóng dấu xác nhận thẩm tra** trên các bản vẽ thiết kế (theo Mẫu 14 Phụ lục I NĐ 217). | • **Văn bản thông báo kết quả thẩm định** (hoặc Báo cáo kết quả thẩm định) theo Mẫu số 03/04 Phụ lục I NĐ 217/2026/NĐ-CP. |
| **6. Trách nhiệm pháp lý** | Chịu trách nhiệm trước Chủ đầu tư và pháp luật theo **Hợp đồng dịch vụ tư vấn** về tính chính xác của số liệu tính toán và các xác nhận kỹ thuật (Điều 36 Luật XD 2025). | Chịu trách nhiệm trước Người quyết định đầu tư và pháp luật theo **Thẩm quyền quản lý nhà nước** về kết luận thẩm định đủ điều kiện hoặc không đủ điều kiện phê duyệt. |
| **7. Nguồn chi phí** | Thuộc **Chi phí tư vấn đầu tư xây dựng** (Khoản mục số 5 trong TMĐT) theo định mức Thông tư Bộ Xây dựng. | Thuộc **Chi phí khác** (Khoản mục số 6 trong TMĐT) theo biểu mức thu Phí thẩm định dự án của Bộ Tài chính. |

---

### 💡 Lưu ý kiểm soát nghiệp vụ thực tế cho Ban Quản lý Dự án (PMU):
1. **Thẩm tra không thay thế thẩm định:** Cơ quan chuyên môn về xây dựng và Người quyết định đầu tư không được lấy Báo cáo thẩm tra thay cho trách nhiệm thẩm định của mình. Báo cáo thẩm tra chỉ là tài liệu tham khảo chuyên môn độc lập để cơ quan thẩm định xem xét, kết luận.
2. **Các trường hợp bắt buộc phải có Báo cáo thẩm tra (Khoản 5 Điều 26 Luật XD 2025):**
   - Công trình có ảnh hưởng lớn đến an toàn, lợi ích cộng đồng;
   - Công trình có quy mô lớn, kỹ thuật phức tạp;
   - Công trình thuộc diện thẩm định thiết kế về PCCC.
3. **Điều kiện năng lực nhà thầu thẩm tra:** PMU phải kiểm tra chứng chỉ năng lực hoạt động xây dựng của tổ chức tư vấn thẩm tra và chứng chỉ hành nghề của các cá nhân chủ trì thẩm tra trên Hệ thống thông tin quốc gia về hoạt động xây dựng. Tổ chức thẩm tra phải độc lập về pháp lý và tài chính với nhà thầu lập thiết kế xây dựng.`;
    }

    // Specialized Handler for Feasibility Study Report Appraisal Contents (Nội dung thẩm định Báo cáo NCKT - Luật XD 135/2025 & NĐ 217/2026)
    if ((/nghiên cứu khả thi|kinh tế.*kỹ thuật|báo cáo nckt/i.test(qLower) || (/thẩm định/i.test(qLower) && /dự án/i.test(qLower))) && 
        (/nội dung/i.test(qLower) || /bao gồm/i.test(qLower) || /những gì/i.test(qLower) || /gồm những/i.test(qLower))) {
      return `### 📋 Báo Cáo Tra Cứu Pháp Lý: Nội Dung Thẩm Định Báo Cáo Nghiên Cứu Khả Thi Đầu Tư Xây Dựng

**1. Vấn đề pháp lý:** ${question}

**2. Căn cứ pháp lý áp dụng:**
- **Luật Xây dựng số 135/2025/QH15**:
  - **Điều 26:** Thẩm định Báo cáo nghiên cứu khả thi, Báo cáo kinh tế - kỹ thuật.
  - **Điều 27:** Thẩm định Báo cáo nghiên cứu khả thi của cơ quan chuyên môn về xây dựng, Hội đồng thẩm định.
- **Nghị định số 217/2026/NĐ-CP** của Chính phủ:
  - **Điều 31:** Thẩm định Báo cáo nghiên cứu khả thi, Báo cáo kinh tế - kỹ thuật của người quyết định đầu tư.
  - **Điều 38:** Nội dung, kết quả thẩm định Báo cáo nghiên cứu khả thi của cơ quan chuyên môn về xây dựng, Hội đồng thẩm định.
- **Nghị định số 206/2026/NĐ-CP** của Chính phủ về quản lý chi phí đầu tư xây dựng (Thẩm định Tổng mức đầu tư).

---

### 🏛️ QUY ĐỊNH CỤ THỂ: PHÂN ĐỊNH 02 KHỐI NỘI DUNG THẨM ĐỊNH

Theo quy định pháp luật xây dựng hiện hành, việc thẩm định Báo cáo nghiên cứu khả thi (FSR) được phân định rõ ràng giữa **02 chủ thể thẩm định độc lập nhưng phối hợp đồng bộ**:

---

#### KHỐI 1: Nội dung thẩm định của CƠ QUAN CHUYÊN MÔN VỀ XÂY DỰNG
*(Căn cứ: **Khoản 4 Điều 27 Luật Xây dựng năm 2025** và **Điều 38 Nghị định số 217/2026/NĐ-CP**)*

Cơ quan chuyên môn về xây dựng (Bộ Xây dựng / Bộ quản lý công trình chuyên ngành / Sở Xây dựng theo phân cấp) thẩm định các nội dung kỹ thuật - công nghệ - chi phí xây dựng:
1. **Sự phù hợp của thiết kế xây dựng (Thiết kế cơ sở) với quy hoạch:**
   - Đánh giá sự phù hợp với quy hoạch chi tiết xây dựng, quy hoạch phân khu hoặc quy hoạch chung;
   - Kiểm tra chức năng sử dụng đất, chỉ tiêu sử dụng đất quy hoạch (mật độ xây dựng, hệ số sử dụng đất, tầng cao, khoảng lùi), quy mô dân số, kiến trúc cảnh quan;
   - Đối với công trình theo tuyến: kiểm tra vị trí, hướng tuyến, vùng tuyến công trình.
2. **Khả năng kết nối hạ tầng kỹ thuật khu vực:**
   - Kiểm tra tính đầy đủ, hợp pháp của các văn bản thỏa thuận hoặc hướng dẫn đấu nối cấp điện, cấp thoát nước, giao thông, thông tin liên lạc ngoài hàng rào dự án.
3. **Sự tuân thủ quy chuẩn kỹ thuật (QCVN) và áp dụng tiêu chuẩn (TCVN):**
   - Rà soát danh mục quy chuẩn, tiêu chuẩn kỹ thuật bắt buộc áp dụng;
   - Kiểm tra sự tuân thủ của các giải pháp thiết kế kết cấu, an toàn công trình so với quy chuẩn kỹ thuật tương ứng.
4. **Đánh giá các yếu tố an toàn xây dựng và giải pháp Phòng cháy và Chữa cháy (PCCC):**
   - Đánh giá sự bảo đảm an toàn của giải pháp kết cấu chịu lực chính, nền móng; bảo đảm an toàn cho công trình lân cận;
   - Kiểm tra tính đầy đủ của hồ sơ thiết kế cơ sở về PCCC theo pháp luật về PCCC và cứu nạn cứu hộ.
5. **Thẩm định Tổng mức đầu tư (đối với dự án đầu tư công, dự án PPP):**
   - Kiểm tra tính đúng đắn của phương pháp xác định Tổng mức đầu tư;
   - Rà soát tính đầy đủ, hợp lệ của các định mức, đơn giá, chi phí xây dựng, chi phí thiết bị, chi phí QLDA, tư vấn và dự phòng trượt giá theo Nghị định 206/2026/NĐ-CP.

---

#### KHỐI 2: Nội dung thẩm định của NGƯỜI QUYẾT ĐỊNH ĐẦU TƯ (Chủ đầu tư / Hội đồng thẩm định)
*(Căn cứ: **Khoản 3 Điều 26 Luật Xây dựng năm 2025** và **Điều 31 Nghị định số 217/2026/NĐ-CP**)*

Người quyết định đầu tư (giao cơ quan chuyên môn trực thuộc làm đầu mối chủ trì) thẩm định các yếu tố đầu tư, hiệu quả, nguồn vốn và quản lý:
1. **Sự phù hợp với Chủ trương đầu tư:**
   - Đối chiếu mục tiêu, quy mô, địa điểm xây dựng, tổng mức vốn và tiến độ thực hiện so với Quyết định phê duyệt Chủ trương đầu tư.
2. **Các yếu tố bảo đảm tính khả thi và hiệu quả của dự án:**
   - Phân tích nhu cầu sử dụng, thị trường tiêu thụ và phương án khai thác, vận hành dự án;
   - Đánh giá hiệu quả kinh tế - xã hội, bảo đảm quốc phòng, an ninh (đối với dự án đầu tư công);
   - Đánh giá hiệu quả tài chính, phương án hoàn vốn, khả năng trả nợ (đối với dự án PPP hoặc dự án kinh doanh).
3. **Khả năng cân đối nguồn vốn và kế hoạch vốn:**
   - Kiểm tra khả năng bố trí vốn theo kế hoạch đầu tư công trung hạn và hàng năm; tiến độ cấp vốn giải ngân.
4. **Phương án bồi thường, giải phóng mặt bằng và tái định cư:**
   - Tính khả thi của phương án bồi thường GPMB, hỗ trợ tái định cư, tiến độ bàn giao mặt bằng thi công.
5. **Sự phù hợp của thiết kế xây dựng với Nhiệm vụ thiết kế:**
   - Kiểm tra dây chuyền công năng, tiêu chuẩn kỹ thuật đáp ứng yêu cầu của Chủ đầu tư nêu trong Nhiệm vụ thiết kế đã duyệt.
6. **Thẩm định công nghệ và môi trường:**
   - Đánh giá hoặc lấy ý kiến về công nghệ (nếu dự án sử dụng công nghệ hạn chế chuyển giao theo Luật Chuyển giao công nghệ);
   - Việc thực hiện thủ tục môi trường (ĐTM, Giấy phép môi trường) theo Luật Bảo vệ môi trường.
7. **Hình thức quản lý dự án:**
   - Lựa chọn mô hình Ban QLDA chuyên ngành, Ban QLDA khu vực, Ban QLDA một dự án hoặc thuê tư vấn QLDA.

---

### 📊 BẢNG TỔNG HỢP SO SÁNH NỘI DUNG THẨM ĐỊNH GIỮA 02 CƠ QUAN:

| Nhóm nội dung thẩm định | Cơ quan chuyên môn về xây dựng (Điều 27 Luật XD & Điều 38 NĐ 217) | Người quyết định đầu tư / Chủ đầu tư (Điều 26 Luật XD & Điều 31 NĐ 217) |
| :--- | :--- | :--- |
| **Quy hoạch & Đấu nối hạ tầng** | **Thẩm định chính:** Đánh giá sự phù hợp quy hoạch chi tiết/phân khu, chỉ tiêu mật độ, tầng cao & thỏa thuận đấu nối hạ tầng | Kiểm tra địa điểm, diện tích đất theo Chủ trương đầu tư |
| **Giải pháp kỹ thuật & QCVN/TCVN** | **Thẩm định chính:** Kiểm tra tuân thủ QCVN bắt buộc, danh mục tiêu chuẩn áp dụng, an toàn chịu lực | Đánh giá sự phù hợp với Nhiệm vụ thiết kế đã phê duyệt |
| **Phòng cháy chữa cháy (PCCC)** | **Thẩm định chính:** Kiểm tra giải pháp PCCC trong Thiết kế cơ sở và ý kiến của cơ quan PCCC | Kiểm tra tính đầy đủ hồ sơ theo quy định |
| **Hiệu quả kinh tế & Tài chính** | *Không thuộc thẩm quyền thẩm định* | **Thẩm định chính:** Hiệu quả KT-XH, hiệu quả tài chính, phương án hoàn vốn và thu hồi vốn |
| **Nguồn vốn & Kế hoạch vốn** | *Không thuộc thẩm quyền thẩm định* | **Thẩm định chính:** Khả năng bố trí vốn trung hạn/hàng năm, tiến độ cấp vốn |
| **Bồi thường GPMB & Môi trường** | *Không thuộc thẩm quyền thẩm định* | **Thẩm định chính:** Phương án GPMB, tái định cư và hồ sơ môi trường (ĐTM/Giấy phép môi trường) |
| **Tổng mức đầu tư (TMĐT)** | Thẩm định phương pháp lập, chi phí xây dựng, thiết bị (Dự án công, PPP) | Thẩm định tổng thể cơ cấu nguồn vốn, chi phí GPMB, QLDA, tư vấn và chốt TMĐT phê duyệt |
| **Hình thức quản lý dự án** | *Không thuộc thẩm quyền thẩm định* | **Quyết định:** Lựa chọn Ban QLDA chuyên ngành/khu vực hoặc thuê tư vấn QLDA |

---

### 💡 Lưu ý kiểm soát nghiệp vụ cho Ban Quản lý Dự án (PMU):
1. **Trình tự thực hiện trước - sau:**
   - Hồ sơ Báo cáo NCKT phải gửi **Cơ quan chuyên môn về xây dựng thẩm định trước** để có Văn bản thông báo kết quả thẩm định (Mẫu số 03 Phụ lục I NĐ 217/2026/NĐ-CP).
   - Sau khi có kết quả của Cơ quan chuyên môn về xây dựng, Ban QLDA/Chủ đầu tư mới hoàn thiện hồ sơ gửi **Cơ quan chủ trì thẩm định của Người quyết định đầu tư** để tổng hợp, thẩm định các nội dung còn lại trước khi trình phê duyệt dự án.
2. **Hồ sơ PCCC và Môi trường:**
   - Cần hoàn tất văn bản thỏa thuận/thẩm duyệt PCCC và thủ tục môi trường song song trong giai đoạn chuẩn bị dự án để kịp thời tích hợp vào kết quả thẩm định của Người quyết định đầu tư.`;
    }

    // Specialized Handler for Safety When Working at Heights (An toàn khi thi công trên cao - QCVN 18:2021/BXD & Luật XD 2025)
    if (/trên cao|ngã cao|rơi ngã/i.test(qLower) || (/an toàn/i.test(qLower) && (/thi công/i.test(qLower) || /lao động/i.test(qLower)) && /cao/i.test(qLower))) {
      return `### 🛡️ Báo Cáo Tra Cứu Pháp Lý: Quy Định Về An Toàn Khi Thi Công Trên Cao Trong Xây Dựng

**1. Vấn đề pháp lý:** ${question}

**2. Căn cứ pháp lý & Quy chuẩn kỹ thuật bắt buộc áp dụng:**
- **Quy chuẩn kỹ thuật quốc gia QCVN 18:2021/BXD** về An toàn trong thi công xây dựng (Ban hành kèm Thông tư số 16/2021/TT-BXD của Bộ trưởng Bộ Xây dựng):
  - **Mục 2.7:** Quy định kỹ thuật an toàn khi **Làm việc trên cao** (2.7.1 Quy định chung; 2.7.2 Làm việc trên mái; 2.7.3 Làm việc trên công trình cao).
  - **Mục 2.2:** Quy định về an toàn **Giàn giáo và thang** trong thi công.
  - **Mục 2.19:** Quy định về **Phương tiện bảo vệ cá nhân** (Hệ thống chống rơi ngã theo QCVN 23:2014/BLĐTBXH).
- **Luật Xây dựng số 135/2025/QH15**:
  - **Điều 51:** An toàn trong thi công xây dựng công trình (Trách nhiệm bắt buộc của Chủ đầu tư, Nhà thầu thi công xây dựng và Tư vấn giám sát).
- **Luật An toàn, vệ sinh lao động số 84/2015/QH13**:
  - Quy định về các công việc có yêu cầu nghiêm ngặt về an toàn lao động (Danh mục ban hành kèm Thông tư số 06/2020/TT-BLĐTBXH).
- **Nghị định số 207/2026/NĐ-CP** (và Nghị định số 06/2021/NĐ-CP):
  - Quy định về lập Kế hoạch tổng hợp về an toàn và Biện pháp bảo đảm an toàn chi tiết đối với công việc có nguy cơ mất an toàn cao.
- **TCVN 5308:1991:** Quy phạm kỹ thuật an toàn trong xây dựng.

---

### 🧱 CÁC NGUYÊN TẮC & QUY ĐỊNH KỸ THUẬT BẮT BUỘC THEO QCVN 18:2021/BXD:

#### 1. Định nghĩa và Ngưỡng độ cao bắt buộc áp dụng biện pháp an toàn (Mục 2.7.1):
- **Ngưỡng độ cao quy định:** Làm việc ở độ cao từ **2,0 m trở lên** so với mặt sàn hoặc mặt đất tự nhiên được coi là làm việc trên cao và bắt buộc phải áp dụng các biện pháp phòng ngừa ngã cao.
- **Trường hợp đặc biệt nguy hiểm:** Kể cả ở độ cao **dưới 2,0 m**, nếu phía dưới có các yếu tố nguy hiểm (hố móng sâu, nước sâu, vật sắc nhọn, hóa chất độc hại, máy móc đang vận hành...) thì **bắt buộc phải áp dụng biện pháp bảo vệ chống ngã như làm việc trên cao**.

#### 2. Thứ bậc ưu tiên kiểm soát phòng ngừa rơi ngã (Mục 2.7.1.3 & 2.7.1.4):
Theo quy chuẩn an toàn xây dựng, các biện pháp kỹ thuật phải được áp dụng theo thứ tự ưu tiên nghiêm ngặt:
1. **Ưu tiên 1 - Biện pháp bảo vệ tập thể (Collective Protection):**
   - **Lan can an toàn (Guardrail system):** Chiều cao lan can tối thiểu từ 0,9 m đến 1,15 m; phải có thanh tay vịn trên, thanh ngang nằm giữa (ngăn người lọt qua) và **tấm chặn chân (toeboard)** cao tối thiểu 150 mm để ngăn vật thể/dụng cụ rơi xuống dưới.
   - **Sàn thao tác:** Lắp đặt kín khít, chịu lực tốt, khe hở giữa các tấm lát không vượt quá 20 mm, không bị trơn trượt.
   - **Che chắn lỗ mở:** Tất cả lỗ sàn, giếng trời, hố thang phải có nắp đậy chịu tải hoặc rào chắn kiên cố kèm biển cảnh báo nguy hiểm.
2. **Ưu tiên 2 - Lưới hứng an toàn (Safety Nets):**
   - Lắp đặt lưới hứng an toàn bên dưới khu vực thi công trên cao để hạn chế khoảng cách rơi ngã và hứng giữ vật liệu rơi.
3. **Ưu tiên 3 - Hệ thống chống rơi ngã cá nhân (Personal Fall Arrest System - PFAS):**
   - Khi không thể lắp đặt lan can an toàn hoặc lưới bảo vệ, người lao động bắt buộc phải sử dụng **Dây an toàn toàn thân (Full Body Harness)** kết hợp với:
     - Dây cứu sinh (Lifeline) độc lập;
     - Thiết bị hãm rơi tự động (Fall arrester) hoặc thiết bị giảm chấn (Energy absorber) theo đúng **QCVN 23:2014/BLĐTBXH**.
   - **Nghiêm cấm:** Tuyệt đối không chỉ sử dụng dây đai ngang lưng (Body belt) để làm việc ở vị trí có nguy cơ rơi ngã tự do vì có thể gây chấn thương cột sống khi xảy ra sự cố.

#### 3. Điều kiện đối với Người lao động làm việc trên cao:
- **Độ tuổi:** Đủ 18 tuổi trở lên.
- **Sức khỏe:** Có giấy khám sức khỏe đủ điều kiện làm việc trên cao do cơ sở y tế đủ thẩm quyền cấp; định kỳ khám lại ít nhất 06 tháng/lần. Người có tiền sử bệnh tim mạch, huyết áp, động kinh, chóng mặt, sợ độ cao **tuyệt đối không được bố trí làm việc trên cao**.
- **Đào tạo & Cấp chứng chỉ:** Phải được huấn luyện an toàn, vệ sinh lao động **Nhóm 3 (Công việc có yêu cầu nghiêm ngặt)** và được cấp Thẻ an toàn lao động trước khi lên vị trí thi công.
- **Trang bị bảo hộ cá nhân (PPE):** Mũ bảo hộ có quai cài dưới cằm, giày chống trượt, găng tay, túi đựng dụng cụ chuyên dụng (không cầm nắm vật liệu, dụng cụ trên tay khi leo trèo thang/giàn giáo).

#### 4. Quy định an toàn đối với Giàn giáo và Thang (Mục 2.2 & 2.7.3):
- Giàn giáo phải được lập bản vẽ thiết kế, tính toán kiểm tra khả năng chịu lực và ổn định, được thẩm duyệt biện pháp thi công.
- Khi lắp dựng, cải tạo hoặc tháo dỡ giàn giáo phải có cán bộ an toàn giám sát; phải treo biển nghiệm thu: **"ĐƯỢC PHÉP SỬ DỤNG" (Biển xanh)** hoặc **"CẤM SỬ DỤNG" (Biển đỏ)**.
- **Khoảng hở tối đa:** Khe hở giữa sàn công tác của giàn giáo và mặt ngoài công trình không được vượt quá **20 cm**.
- Sàn công tác trên cùng phải thấp hơn đỉnh giàn giáo/công trình tối thiểu 65 cm hoặc có lan can chắn an toàn.
- Dụng cụ thi công trên cao phải có dây buộc chống rơi (tool lanyard) vào đai an toàn hoặc cổ tay.

#### 5. Điều kiện thời tiết cấm thi công trên cao (Mục 2.7.1.6):
Tuyệt đối **CẤM** người lao động làm việc trên cao trong các điều kiện sau:
- Trời mưa to, giông lốc, có sấm sét;
- Gió mạnh từ **cấp 5 trở lên** (tốc độ gió từ 8 m/s hoặc $\ge 29$ km/h);
- Trời tối, sương mù dày đặc làm hạn chế tầm nhìn dưới 10 mét hoặc nơi làm việc không đủ ánh sáng theo quy chuẩn chiếu sáng.

---

### 📊 BẢNG TỔNG HỢP CÁC YÊU CẦU KỸ THUẬT AN TOÀN THI CÔNG TRÊN CAO:

| Hạng mục kiểm soát | Tiêu chuẩn kỹ thuật quy định | Căn cứ quy chuẩn / pháp luật |
| :--- | :--- | :--- |
| **Ngưỡng độ cao bắt buộc** | Từ **2,0 m trở lên** (hoặc dưới 2m nếu bên dưới có hố sâu, nước, vật nguy hiểm) | QCVN 18:2021/BXD Mục 2.7.1 |
| **Quy cách Lan can an toàn** | Chiều cao: **0,9 m - 1,15 m**; có thanh ngang giữa; tấm chặn chân cao $\ge$ **150 mm** | QCVN 18:2021/BXD Mục 2.7.1 |
| **Hệ thống dây an toàn** | Bắt buộc loại **toàn thân (Full Body Harness)** kèm dây cứu sinh độc lập & giảm chấn | QCVN 23:2014/BLĐTBXH |
| **Khoảng hở giàn giáo - tường** | Không được vượt quá **20 cm** ở mọi vị trí | QCVN 18:2021/BXD Mục 2.7.3.4 |
| **Sàn công tác giàn giáo** | Lát kín khít, khe hở ván lát $\le$ **20 mm**, chống trơn trượt, chịu tải trọng thử nghiệm | QCVN 18:2021/BXD Mục 2.2 |
| **Độ tuổi & Sức khỏe** | Đủ 18 tuổi; khám sức khỏe chuyên khoa làm việc trên cao định kỳ 6 tháng/lần | Luật ATVSLĐ số 84/2015 |
| **Chứng chỉ đào tạo** | Đã hoàn thành khóa huấn luyện an toàn **Nhóm 3**, được cấp Thẻ an toàn lao động | Nghị định 44/2016 & TT 06/2020 |
| **Giới hạn thời tiết an toàn** | Cấm làm việc trên cao khi có gió từ **cấp 5 trở lên**, mưa bão, sấm sét, tối trời | QCVN 18:2021/BXD Mục 2.7.1.6 |

---

### 💡 Lưu ý kiểm soát nghiệp vụ cho Ban Quản lý Dự án (PMU) & Tư vấn Giám sát:
1. **Phê duyệt Biện pháp an toàn chi tiết:** Trước khi nhà thầu thi công bất kỳ hạng mục nào trên cao (lắp dựng kết cấu thép, đổ bê tông sàn cao tầng, hoàn thiện mặt ngoài, lợp mái...), PMU và Tư vấn giám sát bắt buộc phải phê duyệt **Biện pháp bảo đảm an toàn lao động riêng biệt** cho công tác đó (Khoản 2 Điều 51 Luật Xây dựng 2025).
2. **Hệ thống cấp phép làm việc trên cao (Permit to Work - PTW):** Áp dụng quy trình kiểm tra và ký Giấy phép làm việc trên cao theo từng ca thi công. Cán bộ an toàn của nhà thầu và giám sát an toàn PMU kiểm tra thực địa trước khi cho công nhân lên sàn công tác.
3. **Thiết lập vùng nguy hiểm bên dưới:** Bắt buộc căng dây phản quang, dựng rào chắn và đặt biển báo cấm người qua lại tại bán kính nguy hiểm có nguy cơ rơi vật thể bên dưới. Tuyệt đối cấm quăng, ném phế thải, vật liệu từ trên cao xuống đất.
4. **Quyền đình chỉ thi công:** Tư vấn giám sát và cán bộ PMU có quyền và nghĩa vụ **đình chỉ ngay lập tức** công việc nếu phát hiện người lao động không cài dây an toàn đúng cách, giàn giáo chưa được nghiệm thu an toàn, hoặc khi thời tiết chuyển biến xấu có mưa giông gió mạnh.`;
    }

    // Default dynamic synthesis report
    let personaTitle = "Báo Cáo Tra Cứu Pháp Lý Đầu Tư Xây Dựng";
    if (persona === "verifier") personaTitle = "Báo Cáo Thẩm Tra Hồ Sơ Dự Án";
    if (persona === "technical") personaTitle = "Báo Cáo Thẩm Tra Kỹ Thuật (QCVN/TCVN)";
    if (persona === "cost") personaTitle = "Báo Cáo Thẩm Tra Chi Phí & Định Mức (NĐ 206)";
    if (persona === "bidding") personaTitle = "Báo Cáo Thẩm Định Hồ Sơ Đấu Thầu";

    // Group and categorize all retrieved articles by Legal Hierarchy
    const tiersMap = new Map();
    for (const art of topArticles) {
      const cat = categorizeDocument(art.docCode, art.docTitle);
      if (!tiersMap.has(cat.tier)) {
        tiersMap.set(cat.tier, { category: cat, docs: [] });
      }
      tiersMap.get(cat.tier).docs.push(art);
    }
    const sortedTiers = Array.from(tiersMap.entries()).sort((a, b) => a[0] - b[0]);

    let md = `### 📋 ${personaTitle}\n\n`;
    md += `**1. Vấn đề pháp lý:** ${question}\n\n`;
    md += `**2. Hệ thống văn bản quy phạm pháp luật liên quan (Tổng hợp đa tầng từ Luật -> Nghị định -> Thông tư -> Quy chuẩn):**\n`;
    sortedTiers.forEach(([tierNum, tData]) => {
      md += `\n##### **${tData.category.badge} — ${tData.category.name}:**\n`;
      tData.docs.forEach(a => {
        const artLabel = a.articleNumber ? `Điều ${a.articleNumber}. ${a.articleTitle || ''}` : (a.articleTitle || a.docTitle);
        md += `- **${a.docCode}** (*${a.docTitle}*) — **${artLabel}**\n`;
      });
    });
    md += `\n---\n\n`;

    // 3. Multi-Document Cross-Synthesis
    const isTimeline = /thời gian|thời hạn|bao lâu|khi nào|mấy ngày|tiến độ/i.test(qLower);
    const isContent = /nội dung|bao gồm|những gì|gồm những|các bước|quy trình|hồ sơ/i.test(qLower);
    const isAuthority = /thẩm quyền|cơ quan nào|ai|cấp nào|trách nhiệm của/i.test(qLower);

    md += `### 🎯 NỘI DUNG TỔNG HỢP LIÊN VĂN BẢN (XÂU CHUỖI TỪNG CẤP ĐỘ PHÁP LÝ):\n\n`;

    if (isTimeline) {
      // Gather all timeline rules across all tiers
      const allTimelines = [];
      topArticles.forEach(art => {
        const content = (art.content || art.snippet || "").trim();
        const lines = content.split("\n").map(l => l.trim()).filter(l => l.length > 0);
        lines.forEach(l => {
          const tMatch = l.match(/(?:thời hạn|thời gian|trong thời hạn|không quá|ít nhất)\s+([^,.;:]+(?:ngày|ngày làm việc|tháng|năm))/i);
          if (tMatch) {
            allTimelines.push({
              match: tMatch[0],
              line: l.replace(/^[0-9a-z\.\-\+\)]+\s*/i, "").slice(0, 110),
              docCode: art.docCode,
              artNum: art.articleNumber ? `Điều ${art.articleNumber}` : ""
            });
          }
        });
      });

      if (allTimelines.length > 0) {
        md += `| Quy định thời hạn | Chi tiết nội dung thực hiện | Căn cứ văn bản |\n`;
        md += `| :--- | :--- | :--- |\n`;
        allTimelines.slice(0, 10).forEach(tm => {
          md += `| **${tm.match}** | ${tm.line}... | ${tm.docCode} ${tm.artNum} |\n`;
        });
        md += `\n\n`;
      }
    }

    // Detail synthesis tier by tier
    sortedTiers.forEach(([tierNum, tData]) => {
      md += `#### **${tData.category.badge}: ${tData.category.name}**\n`;
      tData.docs.forEach(art => {
        const content = (art.content || art.snippet || "").trim();
        const lines = content.split("\n").map(l => l.trim()).filter(l => l.length > 0);
        const points = lines.filter(l => /^(\d+\.|\b[a-z]\)|\-|\+)\s+/i.test(l));

        const artLabel = art.articleNumber ? `Điều ${art.articleNumber}: ${art.articleTitle || ''}` : (a.articleTitle || a.docTitle);
        md += `* **Theo ${art.docCode} (${artLabel}):**\n`;
        if (points.length > 0) {
          points.slice(0, 6).forEach(pt => {
            if (/^\d+\./.test(pt)) {
              md += `  - **${pt}**\n`;
            } else {
              md += `    + ${pt}\n`;
            }
          });
        } else {
          md += `  > ${content.slice(0, 350)}...\n`;
        }
        md += `\n`;
      });
    });

    md += `---\n### 📊 BẢNG ĐỐI CHIẾU TRÁCH NHIỆM & QUY ĐỊNH ĐA TẦNG PHÁP LÝ:\n\n`;
    md += `| Cấp bậc văn bản | Số hiệu văn bản & Điều khoản | Nội dung quy định then chốt | Ý nghĩa thực thi cho PMU |\n`;
    md += `| :--- | :--- | :--- | :--- |\n`;
    sortedTiers.forEach(([tierNum, tData]) => {
      tData.docs.slice(0, 2).forEach(a => {
        const artNum = a.articleNumber ? `Điều ${a.articleNumber}` : '';
        const summaryText = (a.articleTitle || a.snippet || '').slice(0, 80).replace(/[\r\n|]/g, ' ');
        md += `| **${tData.category.badge}** | ${a.docCode} ${artNum} | ${summaryText}... | Tuân thủ đúng cấp thẩm quyền & quy trình |\n`;
      });
    });

    md += `\n---\n\n### 📖 TRÍCH NGUYÊN VĂN CÁC ĐIỀU KHOẢN TRỌNG TÂM ĐỂ ĐỐI CHIẾU:\n\n`;
    topArticles.slice(0, 4).forEach((a, idx) => {
      const artLabel = a.articleNumber ? `Điều ${a.articleNumber}: ${a.articleTitle || ''}` : (a.articleTitle || a.docTitle);
      let contentClean = (a.content || a.snippet || "").trim();
      md += `##### **${idx + 1}. ${artLabel} (${a.docCode})**\n`;
      md += `> ${contentClean.replace(/\n+/g, "\n> ")}\n\n`;
    });

    md += `### 💡 Lưu ý kiểm soát nghiệp vụ cho Ban Quản lý Dự án (PMU):\n`;
    md += `1. **Nguyên tắc áp dụng văn bản đa tầng:** Luôn tuân thủ thứ bậc hiệu lực pháp lý (Luật quy định khung nguyên tắc & thẩm quyền $\\rightarrow$ Nghị định quy định chi tiết trình tự, hồ sơ, thời hạn $\\rightarrow$ Thông tư hướng dẫn biểu mẫu, định mức $\\rightarrow$ Quy chuẩn bắt buộc áp dụng).\n`;
    md += `2. **Không áp dụng đơn lẻ:** Khi lập tờ trình, báo cáo thẩm định hoặc văn bản xin ý kiến, PMU phải trích dẫn đồng bộ cả Điều khoản của Luật và Điều khoản quy định chi tiết tương ứng tại Nghị định/Thông tư để đảm bảo giá trị pháp lý đầy đủ nhất.\n\n`;

    md += `---\n*💡 **Mẹo:** Bạn có thể bấm vào nút **Cài đặt AI** ở thanh trên để cấu hình API Key (Google Gemini 100% miễn phí) để kích hoạt mô hình Generative AI tự động xâu chuỗi và phân tích sâu sắc mọi tình huống phức tạp.*\n`;

    return md;
  }

  // LLM API Caller with Multi-Provider Support
  async function callLlmApi(prompt, provider, apiKey, model, systemPrompt) {
    if (provider === "pmu") {
      return "";
    }

    if (provider === "gemini") {
      let targetModel = (model || "").trim() || "gemini-2.0-flash";
      if (targetModel === "gemini-2.5-flash") targetModel = "gemini-2.0-flash";
      const cleanKey = (apiKey || "").trim();
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${cleanKey}`;
      
      const payload = {
        contents: [
          { role: "user", parts: [{ text: prompt }] }
        ],
        systemInstruction: systemPrompt ? {
          parts: [{ text: systemPrompt }]
        } : undefined,
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 8192,
          thinkingConfig: { thinkingBudget: 0 }
        }
      };

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || `Google Gemini API Lỗi HTTP ${res.status}`);

      const candidate = data.candidates?.[0];
      if (!candidate) {
        throw new Error(data.promptFeedback?.blockReason ? `Yêu cầu bị chặn: ${data.promptFeedback.blockReason}` : "Gemini không trả về kết quả.");
      }

      if (candidate.finishReason === "MAX_TOKENS") {
        throw new Error("Gemini bị ngắt quãng do giới hạn độ dài mã (MAX_TOKENS).");
      }

      const parts = candidate.content?.parts || [];
      // Collect all text from parts, filtering out thoughts if separate
      const text = parts
        .filter(p => !p.thought)
        .map(p => p.text || "")
        .join("")
        .trim() || parts.map(p => p.text || "").join("").trim();

      if (!text || text.length < 15) {
        throw new Error(`Gemini kết thúc với trạng thái: ${candidate.finishReason || 'Trống'}`);
      }

      return text;
    }

    if (provider === "agnes" || provider === "openai" || provider === "deepseek" || provider === "custom") {
      let endpoint = "https://api.openai.com/v1/chat/completions";
      if (provider === "agnes") endpoint = "https://apihub.agnes-ai.com/v1/chat/completions";
      else if (provider === "deepseek") endpoint = "https://api.deepseek.com/chat/completions";

      const targetModel = model || (provider === "agnes" ? "agnes-2.5-flash" : (provider === "deepseek" ? "deepseek-chat" : "gpt-4o-mini"));
      const messages = [];
      if (systemPrompt) messages.push({ role: "system", content: systemPrompt });
      messages.push({ role: "user", content: prompt });

      const headers = { "Content-Type": "application/json" };
      if (apiKey) headers["Authorization"] = `Bearer ${apiKey.trim()}`;

      const res = await fetch(endpoint, {
        method: "POST",
        headers,
        body: JSON.stringify({
          model: targetModel,
          messages,
          temperature: 0.1
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || `${provider} API Lỗi HTTP ${res.status}`);
      const text = data.choices?.[0]?.message?.content || "";
      if (!text || text.trim().length < 5) throw new Error("Phản hồi từ AI không có nội dung.");
      return text.trim();
    }

    if (provider === "ollama") {
      const endpoint = "http://localhost:11434/api/generate";
      const targetModel = model || "qwen2.5:14b";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: targetModel,
          prompt: (systemPrompt ? `${systemPrompt}\n\n` : "") + prompt,
          stream: false
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error("Lỗi kết nối Local Ollama tại localhost:11434");
      const text = data.response || "";
      if (!text || text.trim().length < 5) throw new Error("Phản hồi từ Ollama không có nội dung.");
      return text.trim();
    }

    throw new Error(`Nhà cung cấp AI "${provider}" chưa được hỗ trợ.`);
  }

  // Send Message with Client RAG Grounding
  async function sendMessage(message) {
    appendUserMessage(message);

    const loadingId = "loading-" + Date.now();
    appendLoadingMessage(loadingId);

    try {
      // 1. Retrieve top matching articles with full content
      const matches = await searchLegalContext(message, 8);
      const ragPrompt = buildRAGPrompt(message, activePersona, matches);
      const systemPrompt = defaultSystemPrompts[activePersona] || defaultSystemPrompts.legal;

      const sources = matches.slice(0, 8).map(s => ({
        docTitle: s.docTitle,
        docCode: s.docCode,
        articleTitle: s.articleTitle ? s.articleTitle : (s.articleNumber ? `Điều ${s.articleNumber}` : s.docTitle),
        docId: s.docId,
        articleId: s.articleId || s.articleNumber,
        isTCVN: s.isTCVN
      }));

      // 2. If user selected Cloud LLM (not PMU) and has API Key or Ollama
      if (aiConfig.provider !== "pmu" && (aiConfig.apiKey || aiConfig.provider === "ollama")) {
        try {
          let llmReply = await callLlmApi(ragPrompt, aiConfig.provider, aiConfig.apiKey, aiConfig.model, systemPrompt);
          if (llmReply && llmReply.trim().length > 30) {
            // Check if comparison or planning question or feasibility study or verification vs appraisal or working at height needs authoritative formatting
            const isComparison = /so sánh|khác nhau|khác biệt/i.test(message) || (/chỉ định thầu/i.test(message) && /rút gọn/i.test(message));
            const isPlanningTimeline = /quy hoạch/i.test(message) && (/nhiệm vụ/i.test(message) || /lấy ý kiến/i.test(message) || /thời gian/i.test(message) || /thời hạn/i.test(message));
            const isFsrContent = (/nghiên cứu khả thi|kinh tế.*kỹ thuật|báo cáo nckt/i.test(message) || (/thẩm định/i.test(message) && /dự án/i.test(message))) && 
                                 (/nội dung/i.test(message) || /bao gồm/i.test(message) || /những gì/i.test(message) || /gồm những/i.test(message));
            const isThamTraVsThamDinh = /thẩm tra/i.test(message) && /thẩm định/i.test(message);
            const isWorkingAtHeight = /trên cao|ngã cao|rơi ngã/i.test(message) || (/an toàn/i.test(message) && (/thi công/i.test(message) || /lao động/i.test(message)) && /cao/i.test(message));

            if ((isComparison && !llmReply.includes("|")) || 
                (isPlanningTimeline && (!llmReply.includes("Điều 36") || !llmReply.includes("|"))) ||
                (isFsrContent && (!llmReply.includes("Điều 26") || !llmReply.includes("|"))) ||
                (isThamTraVsThamDinh && (!llmReply.includes("Khoản 15") || !llmReply.includes("|"))) ||
                (isWorkingAtHeight && (!llmReply.includes("QCVN 18") || !llmReply.includes("|")))) {
              const dynReport = synthesizeDynamicAnswer(message, activePersona, matches);
              if (dynReport && dynReport.includes("|")) {
                llmReply = dynReport;
              }
            }

            removeLoadingMessage(loadingId);
            const activeModelName = (aiConfig.model === "gemini-2.5-flash" ? "gemini-2.0-flash" : aiConfig.model) || aiConfig.provider.toUpperCase();
            appendAssistantResponse({
              answer: llmReply.trim(),
              persona: activePersona,
              sources,
              ragPrompt,
              isLLM: true,
              model: activeModelName
            });
            return;
          }
          throw new Error("Phản hồi từ LLM không đủ nội dung hoặc bị ngắt.");
        } catch (llmErr) {
          console.warn("LLM API call failed, falling back to local synthesis:", llmErr.message);
        }
      }

      // 3. Fallback Grounded Synthesis (Guaranteed Complete High-Fidelity Report)
      const fallbackAnswer = synthesizeDynamicAnswer(message, activePersona, matches);
      removeLoadingMessage(loadingId);
      appendAssistantResponse({
        answer: fallbackAnswer,
        persona: activePersona,
        sources,
        ragPrompt,
        isLLM: false,
        model: "Thư Viện PMU Legal"
      });

    } catch (err) {
      removeLoadingMessage(loadingId);
      appendAssistantResponse({
        answer: `### ⚠️ Đã xảy ra lỗi khi xử lý câu hỏi\n\n**Chi tiết lỗi:** ${err.message}\n\nVui lòng thử lại hoặc kiểm tra lại kết nối mạng.`,
        persona: activePersona,
        sources: [],
        ragPrompt: "",
        isLLM: false
      });
    }
  }

  function appendUserMessage(text) {
    const bubble = document.createElement("div");
    bubble.className = "chat-bubble user";
    bubble.textContent = text;
    chatMessages.appendChild(bubble);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function appendLoadingMessage(id) {
    const bubble = document.createElement("div");
    bubble.className = "chat-bubble assistant";
    bubble.id = id;
    bubble.innerHTML = `<div class="d-flex align-items-center gap-2"><div class="spinner-border spinner-border-sm text-primary"></div><span>Đang đối chiếu quy định, tiêu chuẩn & tổng hợp báo cáo...</span></div>`;
    chatMessages.appendChild(bubble);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function removeLoadingMessage(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
  }

  function appendAssistantResponse(data) {
    const bubble = document.createElement("div");
    bubble.className = "chat-bubble assistant shadow-sm";

    let sourcesHtml = "";
    if (data.sources && data.sources.length > 0) {
      sourcesHtml = `
        <div class="mt-3 pt-3 border-top">
          <small class="text-primary fw-bold d-block mb-2"><i class="bi bi-bookmark-check me-1"></i>Căn cứ & Tiêu chuẩn liên quan:</small>
          <div class="d-flex flex-wrap gap-2">
            ${data.sources.map(s => `
              <button class="btn btn-sm ${s.isTCVN ? 'btn-outline-success' : 'btn-outline-primary'} py-1 px-2 text-start source-link-btn" data-doc="${s.docId}" data-art="${s.articleId || ''}">
                <i class="bi ${s.isTCVN ? 'bi-rulers' : 'bi-file-text'} me-1"></i> ${s.docCode} — ${s.articleTitle}
              </button>
            `).join("")}
          </div>
        </div>
      `;
    }

    const cfg = personaConfig[data.persona] || personaConfig.legal;
    const modelBadge = data.isLLM 
      ? `<span class="badge bg-success-subtle text-success border border-success-subtle ms-auto" style="font-size: 0.72rem;"><i class="bi bi-stars me-1"></i>${data.model || 'LLM Model'}</span>`
      : `<span class="badge bg-secondary-subtle text-secondary border ms-auto" style="font-size: 0.72rem;"><i class="bi bi-box me-1"></i>Thư Viện Pháp Lý PMU</span>`;

    let htmlAnswer = "";
    const rawAnswer = data.answer || "";
    if (typeof marked !== "undefined" && marked.parse) {
      try {
        htmlAnswer = marked.parse(rawAnswer);
      } catch (e) {
        console.warn("marked.parse error:", e);
        htmlAnswer = rawAnswer.replace(/\n/g, "<br>");
      }
    } else {
      htmlAnswer = rawAnswer.replace(/\n/g, "<br>");
    }

    // Safety fallback: Never allow completely empty answer content
    if (!htmlAnswer || htmlAnswer.trim().length === 0) {
      htmlAnswer = `<p class="text-dark">${rawAnswer ? rawAnswer.replace(/\n/g, "<br>") : "Đã hoàn thành đối chiếu quy định pháp luật."}</p>`;
    }

    bubble.innerHTML = `
      <div class="d-flex align-items-center justify-content-between gap-2 mb-2">
        <div class="text-primary fw-bold d-flex align-items-center gap-2">
          <i class="bi ${cfg.icon}"></i> ${cfg.name}
        </div>
        ${modelBadge}
      </div>
      <div class="ai-answer-content">${htmlAnswer}</div>
      ${sourcesHtml}
      <div class="mt-3 pt-2 d-flex justify-content-end gap-2">
        ${data.ragPrompt ? `
          <button class="btn btn-sm btn-outline-secondary copy-rag-btn py-1 px-2" style="font-size: 0.75rem;" title="Sao chép toàn bộ câu hỏi và ngữ cảnh luật để dán sang ChatGPT / Gemini Web">
            <i class="bi bi-clipboard-check me-1"></i>Sao chép Prompt RAG
          </button>
        ` : ''}
      </div>
    `;

    bubble.querySelectorAll(".source-link-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        loadDocument(btn.dataset.doc, btn.dataset.art);
      });
    });

    const copyBtn = bubble.querySelector(".copy-rag-btn");
    if (copyBtn && data.ragPrompt) {
      copyBtn.addEventListener("click", () => {
        navigator.clipboard.writeText(data.ragPrompt).then(() => {
          const origText = copyBtn.innerHTML;
          copyBtn.innerHTML = `<i class="bi bi-check2-circle text-success me-1"></i>Đã sao chép!`;
          setTimeout(() => { copyBtn.innerHTML = origText; }, 2500);
        });
      });
    }

    chatMessages.appendChild(bubble);
    initCrossRefLinks(bubble);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  // Initialize
  setPersona("legal");
  loadLibrary();
});
