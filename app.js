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

  async function runClientSearch(query) {
    await ensureSearchIndexLoaded();
    if (!searchIndex) return;

    searchResultsContainer.classList.remove("d-none");
    docViewerContainer.classList.add("d-none");
    searchKeyword.textContent = query;

    const terms = query.toLowerCase().split(/\s+/).filter(t => t.length > 0);
    const results = [];

    for (const item of searchIndex) {
      if (searchScope === "phap-ly" && item.scope !== "phap-ly") continue;
      if (searchScope === "tcvn" && item.scope !== "tcvn") continue;

      let score = 0;
      const lowerCode = item.docCode.toLowerCase();
      const lowerTitle = item.title.toLowerCase();

      // Check document code & title
      terms.forEach(t => {
        if (lowerCode.includes(t)) score += 100;
        if (lowerTitle.includes(t)) score += 50;
      });

      // Check articles
      let matchedArticle = null;
      if (item.articles) {
        for (const art of item.articles) {
          let artScore = 0;
          const artTitleLower = (art.title || "").toLowerCase();
          const artSnippetLower = (art.snippet || "").toLowerCase();

          terms.forEach(t => {
            if (art.number?.toString() === t) artScore += 150;
            if (artTitleLower.includes(t)) artScore += 60;
            if (artSnippetLower.includes(t)) artScore += 20;
          });

          if (artScore > score) {
            score = artScore;
            matchedArticle = art;
          }
        }
      }

      if (score > 0) {
        results.push({
          docId: item.id,
          docCode: item.docCode,
          docTitle: item.title,
          categoryName: item.categoryName,
          articleNumber: matchedArticle ? matchedArticle.number : null,
          articleTitle: matchedArticle ? matchedArticle.title : null,
          snippet: matchedArticle ? matchedArticle.snippet : item.title,
          score
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

    chatMessages.innerHTML = `
      <div class="chat-bubble assistant">
        <div class="d-flex align-items-center gap-2 mb-2 text-primary fw-bold">
          <i class="bi ${cfg.icon}"></i> ${cfg.name}
        </div>
        ${cfg.greeting}
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
  let aiConfig = {
    provider: localStorage.getItem("pmu_ai_provider") || "gemini",
    apiKey: localStorage.getItem("pmu_ai_apikey") || "",
    model: localStorage.getItem("pmu_ai_model") || "gemini-2.5-flash"
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
      if (aiConfig.apiKey) {
        activeModelLabel.innerHTML = `<span class="badge bg-success"><i class="bi bi-check-circle me-1"></i>${aiConfig.provider.toUpperCase()}</span>`;
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
      aiConfig = { provider: "gemini", apiKey: "", model: "gemini-2.5-flash" };
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

  // Send Message with Client RAG Grounding
  async function sendMessage(message) {
    appendMessage(message, "user");

    if (!aiConfig.apiKey && aiConfig.provider !== "ollama") {
      appendMessage(`
        <div class="alert alert-warning border-0 p-3 rounded-3 mb-0">
          <h6 class="fw-bold mb-1"><i class="bi bi-key-fill me-1"></i>Chưa Cấu Hình API Key AI</h6>
          <p class="small mb-2">Để sử dụng tính năng Trợ lý AI trên phiên bản Web Tĩnh, bạn chỉ cần nhập Khóa API cá nhân (miễn phí) để kết nối trực tiếp từ trình duyệt của bạn.</p>
          <button class="btn btn-sm btn-primary" data-bs-toggle="modal" data-bs-target="#aiSettingsModal">
            <i class="bi bi-sliders me-1"></i>Mở Cài Đặt AI & Nhập API Key
          </button>
        </div>
      `, "assistant");
      return;
    }

    const loadingId = "loading-" + Date.now();
    appendLoadingMessage(loadingId);

    try {
      // 1. Retrieve top 3 relevant legal snippets from searchIndex
      await ensureSearchIndexLoaded();
      let contextSnippet = "";
      if (searchIndex) {
        const terms = message.toLowerCase().split(/\s+/).filter(t => t.length > 2);
        const matches = [];
        for (const item of searchIndex) {
          let score = 0;
          if (item.articles) {
            for (const art of item.articles) {
              terms.forEach(t => {
                if ((art.title || "").toLowerCase().includes(t)) score += 3;
                if ((art.snippet || "").toLowerCase().includes(t)) score += 1;
              });
              if (score > 0) {
                matches.push({ docCode: item.docCode, title: art.title, snippet: art.snippet, score });
              }
            }
          }
        }
        matches.sort((a, b) => b.score - a.score);
        contextSnippet = matches.slice(0, 3).map(m => `[${m.docCode} - ${m.title}]: ${m.snippet}`).join("\n\n");
      }

      // 2. Call LLM Direct Client-Side
      const cfg = personaConfig[activePersona] || personaConfig.legal;
      const systemPrompt = `Bạn là ${cfg.name}, chuyên gia pháp lý và kỹ thuật xây dựng hàng đầu cho Ban QLDA (PMU) Việt Nam năm 2026.
Trả lời câu hỏi của người dùng một cách chính xác, bám sát các Luật (Luật Xây dựng 135/2025, Luật Đấu thầu 22/2023, Luật Đầu tư công 58/2024), Nghị định (NĐ 217/2026, NĐ 206/2026, NĐ 207/2026, NĐ 214/2025) và Tiêu chuẩn xây dựng.
Nếu có căn cứ trong tài liệu đối chiếu dưới đây, hãy trích dẫn cụ thể Điều, Khoản:
${contextSnippet ? `--- CĂN CỨ THAM KHẢO ---\n${contextSnippet}\n--- HẾT CĂN CỨ ---` : ""}`;

      const reply = await callLlmApi(message, aiConfig.provider, aiConfig.apiKey, aiConfig.model, systemPrompt);
      removeLoadingMessage(loadingId);
      appendMessage(reply, "assistant");
    } catch (err) {
      removeLoadingMessage(loadingId);
      appendMessage("Đã xảy ra lỗi khi gọi AI: " + err.message, "assistant");
    }
  }

  async function callLlmApi(userQuery, provider, apiKey, model, systemPrompt) {
    if (provider === "gemini") {
      const targetModel = model || "gemini-2.5-flash";
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${apiKey}`;
      const payload = {
        contents: [
          { role: "user", parts: [{ text: (systemPrompt ? `${systemPrompt}\n\n` : "") + userQuery }] }
        ]
      };
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "Lỗi Google Gemini API");
      return data.candidates?.[0]?.content?.parts?.[0]?.text || "Không có phản hồi.";
    }

    if (provider === "openai" || provider === "deepseek") {
      const endpoint = provider === "deepseek" ? "https://api.deepseek.com/chat/completions" : "https://api.openai.com/v1/chat/completions";
      const targetModel = model || (provider === "deepseek" ? "deepseek-chat" : "gpt-4o-mini");
      const messages = [];
      if (systemPrompt) messages.push({ role: "system", content: systemPrompt });
      messages.push({ role: "user", content: userQuery });

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({ model: targetModel, messages })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "Lỗi OpenAI/DeepSeek API");
      return data.choices?.[0]?.message?.content || "Không có phản hồi.";
    }

    if (provider === "ollama") {
      const endpoint = "http://localhost:11434/api/generate";
      const targetModel = model || "llama3";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: targetModel,
          prompt: (systemPrompt ? `${systemPrompt}\n\n` : "") + userQuery,
          stream: false
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error("Lỗi kết nối Local Ollama tại localhost:11434");
      return data.response || "Không có phản hồi.";
    }

    throw new Error(`Nhà cung cấp AI "${provider}" chưa được hỗ trợ.`);
  }

  function appendMessage(text, role) {
    const bubble = document.createElement("div");
    bubble.className = `chat-bubble ${role}`;
    bubble.innerHTML = text.replace(/\n/g, "<br>");
    chatMessages.appendChild(bubble);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function appendLoadingMessage(id) {
    const bubble = document.createElement("div");
    bubble.className = "chat-bubble assistant";
    bubble.id = id;
    bubble.innerHTML = `<div class="d-flex align-items-center gap-2"><div class="spinner-border spinner-border-sm text-primary"></div><span>Đang suy luận & đối chiếu pháp lý...</span></div>`;
    chatMessages.appendChild(bubble);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function removeLoadingMessage(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
  }

  // Initialize
  setPersona("legal");
  loadLibrary();
});
