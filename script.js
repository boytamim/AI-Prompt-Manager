// Default Data
const defaultCategories = [
  'Writing', 'Coding', 'Image Generation', 'Business', 
  'Marketing', 'Productivity', 'Research', 'Other'
];

const samplePrompts = [
  {
    id: 'p_' + Date.now().toString() + '1',
    title: 'Code Review Assistant',
    description: 'Acts as a senior developer reviewing code',
    content: 'Act as a senior software engineer. Review the following code for best practices, security vulnerabilities, performance issues, and readability. Provide constructive feedback and suggested code improvements:\n\n[INSERT CODE HERE]',
    category: 'Coding',
    tags: ['review', 'developer', 'quality'],
    model: 'ChatGPT',
    favorite: true,
    createdAt: Date.now() - 100000,
    updatedAt: Date.now() - 100000
  },
  {
    id: 'p_' + Date.now().toString() + '2',
    title: 'Blog Post Generator',
    description: 'Generates SEO-friendly blog posts',
    content: 'Write a comprehensive, SEO-friendly blog post about [TOPIC]. The tone should be [TONE]. Include an introduction, 3-4 main sections with headers, and a conclusion. Target audience is [AUDIENCE]. Incorporate these keywords naturally: [KEYWORDS].',
    category: 'Writing',
    tags: ['seo', 'blog', 'content'],
    model: 'Any',
    favorite: false,
    createdAt: Date.now() - 50000,
    updatedAt: Date.now() - 50000
  },
  {
    id: 'p_' + Date.now().toString() + '3',
    title: 'Midjourney Portrait',
    description: 'Photorealistic portrait prompt formula',
    content: 'A hyper-realistic portrait photography of a [SUBJECT], [LIGHTING CONDITIONS], shot on 85mm lens, f/1.8, extremely detailed, 8k, cinematic lighting, --ar 4:5 --v 6.0',
    category: 'Image Generation',
    tags: ['portrait', 'photography'],
    model: 'Midjourney',
    favorite: true,
    createdAt: Date.now(),
    updatedAt: Date.now()
  }
];

// App State
let state = {
  prompts: [],
  categories: [],
  currentView: 'dashboard', // dashboard, all, favorites, category, settings
  currentCategory: null,
  searchQuery: '',
  sortMode: 'newest', // newest, oldest, az, za
  categoryFilter: 'all',
  currentTags: [], // For modal
  editingId: null,
  theme: 'dark'
};

// DOM Elements
const els = {
  sidebar: document.getElementById('sidebar'),
  mobileToggle: document.getElementById('mobile-toggle'),
  categoryNavList: document.getElementById('category-nav-list'),
  totalBadge: document.getElementById('total-prompts-badge'),
  favBadge: document.getElementById('fav-prompts-badge'),
  
  navItems: document.querySelectorAll('.nav-item'),
  
  globalSearch: document.getElementById('global-search'),
  btnAddPrompt: document.getElementById('btn-add-prompt'),
  
  pageTitle: document.getElementById('page-title'),
  filtersBar: document.getElementById('filters-bar'),
  sortSelect: document.getElementById('sort-select'),
  categoryFilter: document.getElementById('category-filter'),
  
  promptsGrid: document.getElementById('prompts-grid'),
  settingsView: document.getElementById('settings-view'),
  
  // Modal Elements
  promptModal: document.getElementById('prompt-modal'),
  promptModalClose: document.getElementById('prompt-modal-close'),
  promptModalCancel: document.getElementById('prompt-modal-cancel'),
  promptForm: document.getElementById('prompt-form'),
  promptModalTitle: document.getElementById('prompt-modal-title'),
  tagsInput: document.getElementById('tags-input'),
  tagsContainer: document.getElementById('tags-container'),
  
  // View Modal
  viewModal: document.getElementById('view-modal'),
  viewModalClose: document.getElementById('view-modal-close'),
  viewModalTitle: document.getElementById('view-modal-title'),
  viewModalDesc: document.getElementById('view-modal-desc'),
  viewModalBadges: document.getElementById('view-modal-badges'),
  viewModalContent: document.getElementById('view-modal-content'),
  viewModalCopy: document.getElementById('view-modal-copy'),
  viewModalEdit: document.getElementById('view-modal-edit'),
  
  toastContainer: document.getElementById('toast-container'),
  
  // Settings
  btnExport: document.getElementById('btn-export'),
  btnImportTrigger: document.getElementById('btn-import-trigger'),
  fileImport: document.getElementById('file-import'),
  btnClearData: document.getElementById('btn-clear-data'),
  themeSelect: document.getElementById('theme-select')
};

// Initialization
function init() {
  loadData();
  setupEventListeners();
  renderCategories();
  updateSidebarCounts();
  renderView();
}

// Data Management
function loadData() {
  const storedPrompts = localStorage.getItem('apm_prompts');
  const storedCategories = localStorage.getItem('apm_categories');
  const storedTheme = localStorage.getItem('apm_theme');
  
  if (storedTheme) {
    state.theme = storedTheme;
    applyTheme();
  }
  
  if (storedPrompts) {
    state.prompts = JSON.parse(storedPrompts);
  } else {
    state.prompts = [...samplePrompts];
    saveData();
  }
  
  if (storedCategories) {
    state.categories = JSON.parse(storedCategories);
  } else {
    state.categories = [...defaultCategories];
    saveCategories();
  }
}

function saveData() {
  localStorage.setItem('apm_prompts', JSON.stringify(state.prompts));
  updateSidebarCounts();
}

function saveCategories() {
  localStorage.setItem('apm_categories', JSON.stringify(state.categories));
}

function applyTheme() {
  if (state.theme === 'light') {
    document.body.classList.add('light-mode');
  } else {
    document.body.classList.remove('light-mode');
  }
  if (els.themeSelect) els.themeSelect.value = state.theme;
}

function saveTheme() {
  localStorage.setItem('apm_theme', state.theme);
}

// Utility
function escapeHTML(str) {
  if (!str) return '';
  return str.replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag])
  );
}

function generateId() {
  return 'p_' + Date.now().toString() + Math.random().toString(36).substr(2, 5);
}

function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  const icon = type === 'success' ? 'ph-check-circle' : 'ph-warning-circle';
  toast.innerHTML = `<i class="ph ${icon}"></i><span>${escapeHTML(message)}</span>`;
  
  els.toastContainer.appendChild(toast);
  
  // Trigger animation
  setTimeout(() => toast.classList.add('show'), 10);
  
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Rendering
function renderCategories() {
  // Sidebar categories
  els.categoryNavList.innerHTML = state.categories.map(cat => `
    <a href="#" class="nav-item" data-view="category" data-category="${escapeHTML(cat)}">
      <i class="ph ph-folder nav-icon"></i>
      <span class="nav-label">${escapeHTML(cat)}</span>
    </a>
  `).join('');
  
  // Select dropdowns
  const categoryOptions = state.categories.map(cat => 
    `<option value="${escapeHTML(cat)}">`
  ).join('');
  
  const formSelect = document.getElementById('category-options');
  formSelect.innerHTML = categoryOptions;
  
  const filterOptions = state.categories.map(cat => 
    `<option value="${escapeHTML(cat)}">${escapeHTML(cat)}</option>`
  ).join('');
  els.categoryFilter.innerHTML = `<option value="all">All Categories</option>` + filterOptions;
  
  // Re-attach sidebar listeners for dynamic items
  document.querySelectorAll('#category-nav-list .nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      handleNavigation(item);
    });
  });
}

function updateSidebarCounts() {
  els.totalBadge.textContent = state.prompts.length;
  els.favBadge.textContent = state.prompts.filter(p => p.favorite).length;
}

function handleNavigation(navItem) {
  // Update active state
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
  navItem.classList.add('active');
  
  const view = navItem.dataset.view;
  state.currentView = view;
  
  if (view === 'category') {
    state.currentCategory = navItem.dataset.category;
  } else {
    state.currentCategory = null;
  }
  
  if (window.innerWidth <= 768) {
    els.sidebar.classList.remove('active');
  }
  
  renderView();
}

function renderView() {
  // Reset search and filters on view change unless it's a search update
  
  els.promptsGrid.classList.remove('hidden');
  els.settingsView.classList.add('hidden');
  els.filtersBar.classList.remove('hidden');
  
  let title = 'Dashboard';
  let filteredPrompts = [...state.prompts];
  
  if (state.currentView === 'dashboard') {
    title = 'Dashboard';
  } else if (state.currentView === 'all') {
    title = 'All Prompts';
  } else if (state.currentView === 'favorites') {
    title = 'Favorites';
    filteredPrompts = filteredPrompts.filter(p => p.favorite);
  } else if (state.currentView === 'category') {
    title = `Category: ${state.currentCategory}`;
    filteredPrompts = filteredPrompts.filter(p => p.category === state.currentCategory);
    // Auto-set the category filter to match
    els.categoryFilter.value = state.currentCategory;
  } else if (state.currentView === 'settings') {
    title = 'Settings';
    els.promptsGrid.classList.add('hidden');
    els.filtersBar.classList.add('hidden');
    els.settingsView.classList.remove('hidden');
    els.pageTitle.textContent = title;
    return;
  }
  
  els.pageTitle.textContent = title;
  
  // Apply Search
  if (state.searchQuery) {
    const q = state.searchQuery.toLowerCase();
    filteredPrompts = filteredPrompts.filter(p => 
      (p.title && p.title.toLowerCase().includes(q)) ||
      (p.content && p.content.toLowerCase().includes(q)) ||
      (p.description && p.description.toLowerCase().includes(q)) ||
      (p.tags && p.tags.some(t => t.toLowerCase().includes(q)))
    );
  }
  
  // Apply Category Filter (if we are in 'all' or 'dashboard' or 'favorites')
  if (state.categoryFilter !== 'all' && state.currentView !== 'category') {
    filteredPrompts = filteredPrompts.filter(p => p.category === state.categoryFilter);
  }
  
  // Apply Sort
  filteredPrompts.sort((a, b) => {
    switch (state.sortMode) {
      case 'newest': return b.createdAt - a.createdAt;
      case 'oldest': return a.createdAt - b.createdAt;
      case 'az': return a.title.localeCompare(b.title);
      case 'za': return b.title.localeCompare(a.title);
      default: return 0;
    }
  });
  
  renderPromptsList(filteredPrompts);
}

function renderPromptsList(prompts) {
  if (prompts.length === 0) {
    els.promptsGrid.innerHTML = `
      <div class="empty-state">
        <i class="ph ph-files empty-icon"></i>
        <h3 class="empty-title">No prompts found</h3>
        <p class="empty-desc">
          ${state.searchQuery ? 'Try adjusting your search or filters.' : 'Get started by creating your first AI prompt.'}
        </p>
        ${!state.searchQuery && state.currentView !== 'favorites' ? `<button class="btn btn-primary" onclick="openAddModal()">Create Prompt</button>` : ''}
      </div>
    `;
    return;
  }
  
  els.promptsGrid.innerHTML = prompts.map(p => `
    <div class="prompt-card">
      <div class="card-header">
        <h3 class="card-title">${escapeHTML(p.title)}</h3>
        <div class="card-actions">
          <button class="card-btn favorite-btn ${p.favorite ? 'active' : ''}" data-id="${p.id}" title="${p.favorite ? 'Remove from favorites' : 'Add to favorites'}">
            <i class="${p.favorite ? 'ph-fill' : 'ph'} ph-star"></i>
          </button>
          <button class="card-btn copy-btn" data-id="${p.id}" title="Copy Prompt">
            <i class="ph ph-copy"></i>
          </button>
        </div>
      </div>
      
      <div class="card-badges">
        <span class="card-badge category">${escapeHTML(p.category || 'Uncategorized')}</span>
        ${p.model ? `<span class="card-badge model">${escapeHTML(p.model)}</span>` : ''}
      </div>
      
      <p class="card-desc">${escapeHTML(p.description || '')}</p>
      
      <div class="card-footer">
        <span class="card-date">${new Date(p.createdAt).toLocaleDateString()}</span>
        <div class="card-actions">
          <button class="card-btn view-btn" data-id="${p.id}" title="View Details">
            <i class="ph ph-eye"></i>
          </button>
          <button class="card-btn duplicate-btn" data-id="${p.id}" title="Duplicate">
            <i class="ph ph-copy-simple"></i>
          </button>
          <button class="card-btn edit-btn" data-id="${p.id}" title="Edit">
            <i class="ph ph-pencil"></i>
          </button>
          <button class="card-btn delete-btn" data-id="${p.id}" title="Delete">
            <i class="ph ph-trash"></i>
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

// Interactions & Event Listeners
function setupEventListeners() {
  // Mobile toggle
  els.mobileToggle.addEventListener('click', () => {
    els.sidebar.classList.toggle('active');
  });
  
  // Navigation
  els.navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      handleNavigation(item);
    });
  });
  
  // Search
  els.globalSearch.addEventListener('input', (e) => {
    state.searchQuery = e.target.value;
    renderView();
  });
  
  // Filters
  els.sortSelect.addEventListener('change', (e) => {
    state.sortMode = e.target.value;
    renderView();
  });
  
  els.categoryFilter.addEventListener('change', (e) => {
    state.categoryFilter = e.target.value;
    renderView();
  });
  
  // Modals
  els.btnAddPrompt.addEventListener('click', openAddModal);
  els.promptModalClose.addEventListener('click', closePromptModal);
  els.promptModalCancel.addEventListener('click', (e) => { e.preventDefault(); closePromptModal(); });
  
  els.viewModalClose.addEventListener('click', closeViewModal);
  
  // Form Submit
  els.promptForm.addEventListener('submit', handleFormSubmit);
  
  // Tags Input
  els.tagsInput.addEventListener('keydown', handleTagsInput);
  els.tagsInput.addEventListener('focus', () => els.tagsContainer.classList.add('focus'));
  els.tagsInput.addEventListener('blur', () => els.tagsContainer.classList.remove('focus'));
  
  // Grid actions (delegation)
  els.promptsGrid.addEventListener('click', (e) => {
    const btn = e.target.closest('.card-btn');
    if (!btn) return;
    
    const id = btn.dataset.id;
    if (btn.classList.contains('favorite-btn')) toggleFavorite(id);
    else if (btn.classList.contains('copy-btn')) copyPrompt(id);
    else if (btn.classList.contains('delete-btn')) deletePrompt(id);
    else if (btn.classList.contains('edit-btn')) openEditModal(id);
    else if (btn.classList.contains('view-btn')) openViewModal(id);
    else if (btn.classList.contains('duplicate-btn')) duplicatePrompt(id);
  });
  
  // View Modal actions
  els.viewModalCopy.addEventListener('click', () => {
    const id = els.viewModalCopy.dataset.id;
    copyPrompt(id);
  });
  
  els.viewModalEdit.addEventListener('click', () => {
    const id = els.viewModalEdit.dataset.id;
    closeViewModal();
    openEditModal(id);
  });
  
  // Settings Actions
  els.btnExport.addEventListener('click', exportData);
  els.btnImportTrigger.addEventListener('click', () => els.fileImport.click());
  els.fileImport.addEventListener('change', importData);
  els.btnClearData.addEventListener('click', clearData);
  els.themeSelect.addEventListener('change', (e) => {
    state.theme = e.target.value;
    applyTheme();
    saveTheme();
  });
}

// Modal Actions
function openAddModal() {
  state.editingId = null;
  els.promptForm.reset();
  document.getElementById('prompt-id').value = '';
  els.promptModalTitle.textContent = 'Add New Prompt';
  
  state.currentTags = [];
  renderTags();
  
  if (state.currentCategory && state.currentCategory !== 'all') {
    document.getElementById('prompt-category').value = state.currentCategory;
  }
  
  els.promptModal.classList.add('active');
}

function openEditModal(id) {
  const prompt = state.prompts.find(p => p.id === id);
  if (!prompt) return;
  
  state.editingId = id;
  els.promptModalTitle.textContent = 'Edit Prompt';
  
  document.getElementById('prompt-id').value = prompt.id;
  document.getElementById('prompt-title').value = prompt.title;
  document.getElementById('prompt-desc').value = prompt.description || '';
  document.getElementById('prompt-content').value = prompt.content;
  document.getElementById('prompt-category').value = prompt.category;
  document.getElementById('prompt-model').value = prompt.model || 'Any';
  
  state.currentTags = [...(prompt.tags || [])];
  renderTags();
  
  els.promptModal.classList.add('active');
}

function closePromptModal() {
  els.promptModal.classList.remove('active');
}

function openViewModal(id) {
  const prompt = state.prompts.find(p => p.id === id);
  if (!prompt) return;
  
  els.viewModalTitle.textContent = prompt.title;
  els.viewModalDesc.textContent = prompt.description || 'No description';
  
  let badgesHTML = `<span class="card-badge category">${escapeHTML(prompt.category)}</span>`;
  if (prompt.model) {
    badgesHTML += `<span class="card-badge model">${escapeHTML(prompt.model)}</span>`;
  }
  if (prompt.tags && prompt.tags.length > 0) {
    badgesHTML += prompt.tags.map(t => `<span class="card-badge"><i class="ph ph-tag"></i> ${escapeHTML(t)}</span>`).join('');
  }
  
  els.viewModalBadges.innerHTML = badgesHTML;
  els.viewModalContent.textContent = prompt.content; // textContent handles escaping
  
  els.viewModalCopy.dataset.id = prompt.id;
  els.viewModalEdit.dataset.id = prompt.id;
  
  els.viewModal.classList.add('active');
}

function closeViewModal() {
  els.viewModal.classList.remove('active');
}

// Form & Tags
function handleTagsInput(e) {
  if (e.key === 'Enter') {
    e.preventDefault();
    const tag = e.target.value.trim().toLowerCase();
    if (tag && !state.currentTags.includes(tag)) {
      state.currentTags.push(tag);
      renderTags();
    }
    e.target.value = '';
  }
}

function removeTag(index) {
  state.currentTags.splice(index, 1);
  renderTags();
}

function renderTags() {
  // Remove existing badges
  const existingBadges = els.tagsContainer.querySelectorAll('.tag-badge');
  existingBadges.forEach(b => b.remove());
  
  // Add new badges before the input
  state.currentTags.forEach((tag, idx) => {
    const badge = document.createElement('div');
    badge.className = 'tag-badge';
    badge.innerHTML = `
      <span>${escapeHTML(tag)}</span>
      <i class="ph ph-x tag-remove" onclick="removeTag(${idx})"></i>
    `;
    els.tagsContainer.insertBefore(badge, els.tagsInput);
  });
}

function handleFormSubmit(e) {
  e.preventDefault();
  
  const title = document.getElementById('prompt-title').value.trim();
  const description = document.getElementById('prompt-desc').value.trim();
  const content = document.getElementById('prompt-content').value.trim();
  const category = document.getElementById('prompt-category').value.trim() || 'Other';
  const model = document.getElementById('prompt-model').value;
  
  if (!title || !content) return;

  // Add new category if it doesn't exist
  if (!state.categories.includes(category)) {
    state.categories.push(category);
    saveCategories();
    renderCategories();
  }
  
  if (state.editingId) {
    // Update
    const idx = state.prompts.findIndex(p => p.id === state.editingId);
    if (idx !== -1) {
      state.prompts[idx] = {
        ...state.prompts[idx],
        title,
        description,
        content,
        category,
        model,
        tags: [...state.currentTags],
        updatedAt: Date.now()
      };
      showToast('Prompt updated successfully');
    }
  } else {
    // Create
    const newPrompt = {
      id: generateId(),
      title,
      description,
      content,
      category,
      model,
      tags: [...state.currentTags],
      favorite: false,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    state.prompts.unshift(newPrompt); // Add to beginning
    showToast('Prompt created successfully');
  }
  
  saveData();
  closePromptModal();
  renderView();
}

// Actions
function toggleFavorite(id) {
  const prompt = state.prompts.find(p => p.id === id);
  if (prompt) {
    prompt.favorite = !prompt.favorite;
    saveData();
    renderView();
    if (prompt.favorite) {
      showToast('Added to favorites');
    }
  }
}

function deletePrompt(id) {
  if (confirm('Are you sure you want to delete this prompt?')) {
    state.prompts = state.prompts.filter(p => p.id !== id);
    saveData();
    renderView();
    showToast('Prompt deleted');
  }
}

function duplicatePrompt(id) {
  const original = state.prompts.find(p => p.id === id);
  if (original) {
    const duplicated = {
      ...original,
      id: generateId(),
      title: `${original.title} (Copy)`,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    state.prompts.unshift(duplicated);
    saveData();
    renderView();
    showToast('Prompt duplicated');
  }
}

function copyPrompt(id) {
  const prompt = state.prompts.find(p => p.id === id);
  if (prompt && prompt.content) {
    navigator.clipboard.writeText(prompt.content).then(() => {
      showToast('Copied to clipboard!');
    }).catch(err => {
      console.error('Could not copy text: ', err);
      showToast('Failed to copy', 'error');
    });
  }
}

// Data Management Settings
function exportData() {
  const data = {
    prompts: state.prompts,
    categories: state.categories,
    version: 1,
    exportedAt: Date.now()
  };
  
  const dataStr = JSON.stringify(data, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
  
  const exportFileDefaultName = `ai-prompt-manager-backup-${new Date().toISOString().slice(0,10)}.json`;
  
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
  
  showToast('Data exported successfully');
}

function importData(e) {
  const file = e.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = function(event) {
    try {
      const data = JSON.parse(event.target.result);
      
      if (!data.prompts || !Array.isArray(data.prompts)) {
        throw new Error("Invalid file format: missing prompts array");
      }
      
      // Merge Prompts avoiding exact ID duplicates
      const existingIds = new Set(state.prompts.map(p => p.id));
      let importedCount = 0;
      
      data.prompts.forEach(p => {
        if (!p.id || !p.title || !p.content) return; // skip invalid
        
        // If ID exists, regenerate ID to avoid overwrite, or maybe overwrite? 
        // Requirements say: "Validate imported data before modifying. Do not silently overwrite existing user data."
        if (existingIds.has(p.id)) {
          p.id = generateId(); // give it a new id
        }
        state.prompts.push(p);
        importedCount++;
      });
      
      // Merge Categories
      if (data.categories && Array.isArray(data.categories)) {
        data.categories.forEach(c => {
          if (!state.categories.includes(c)) {
            state.categories.push(c);
          }
        });
      }
      
      saveData();
      saveCategories();
      renderCategories();
      renderView();
      
      showToast(`Successfully imported ${importedCount} prompts`);
    } catch (err) {
      console.error(err);
      showToast('Error importing file: Invalid format', 'error');
    }
    
    // Reset file input
    els.fileImport.value = '';
  };
  reader.readAsText(file);
}

function clearData() {
  if (confirm('WARNING: This will permanently delete ALL prompts and categories. This cannot be undone. Are you absolutely sure?')) {
    state.prompts = [];
    state.categories = [...defaultCategories];
    saveData();
    saveCategories();
    renderCategories();
    
    // Go to dashboard
    document.querySelector('.nav-item[data-view="dashboard"]').click();
    showToast('All data cleared successfully');
  }
}

// Start
init();
