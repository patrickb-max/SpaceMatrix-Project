<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { SERVICES, type Property, type InquiryPayload } from '$lib';

  export let data: {
    properties: Property[];
    selectedType: string;
    error?: string;
  };

  const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80';

  // Modal State
  let activeProperty: Property | null = null;
  let formName = '';
  let formEmail = '';
  let formPhone = '';
  let formMessage = '';
  let submitting = false;
  let submitSuccess = false;
  let submitError: string | null = null;

  const filterTabs = [
    { label: 'All Spaces', value: 'all' },
    { label: 'Office', value: 'office' },
    { label: 'Warehouse', value: 'warehouse' },
    { label: 'Retail', value: 'retail' }
  ];

  // Analytics Microservice Trigger (:3003)
  async function trackEvent(eventType: string, metadata: Record<string, unknown> = {}) {
    try {
      await fetch(`${SERVICES.ANALYTICS}/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventType, metadata, timestamp: new Date() })
      });
    } catch (err) {
      console.warn('Analytics service offline:', err);
    }
  }

  function setCategory(value: string) {
    trackEvent('FILTER_CLICK', { category: value });
    if (value === 'all') {
      goto('/');
    } else {
      goto(`/?type=${value}`);
    }
  }

  function openInquiryModal(property: Property) {
    activeProperty = property;
    formName = '';
    formEmail = '';
    formPhone = '';
    formMessage = `Hi, I am interested in leasing ${property.name}. Please contact me with more details.`;
    submitSuccess = false;
    submitError = null;

    trackEvent('INQUIRY_MODAL_OPENED', { propertyId: property._id, propertyName: property.name });
  }

  function closeModal() {
    activeProperty = null;
  }

  // Combined Inquiry (:3002) & Notification (:3004) Trigger
  async function handleInquirySubmit() {
    if (!activeProperty) return;

    submitting = true;
    submitError = null;

    const payload: InquiryPayload = {
      propertyId: activeProperty._id || null,
      propertyName: activeProperty.name,
      inquirerName: formName,
      inquirerEmail: formEmail,
      phone: formPhone,
      message: formMessage
    };

    try {
      // 1. Save to Inquiry Microservice (:3002)
      const inquiryRes = await fetch(SERVICES.INQUIRY, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!inquiryRes.ok) {
        const errData = await inquiryRes.json();
        throw new Error(errData.message || 'Inquiry service failed to save.');
      }

      // 2. Dispatch alert via Notification Microservice (:3004)
      fetch(`${SERVICES.NOTIFICATION}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'NEW_LEASING_INQUIRY',
          recipient: 'manager@spacematrix.com',
          details: payload
        })
      }).catch(err => console.warn('Notification service failed:', err));

      // 3. Log Conversion in Analytics Microservice (:3003)
      trackEvent('INQUIRY_SUBMITTED_SUCCESS', { propertyId: activeProperty._id });

      submitSuccess = true;
      setTimeout(() => closeModal(), 2000);
    } catch (err) {
      console.error('Submission error:', err);
      submitError = err instanceof Error ? err.message : 'An unknown error occurred';
    } finally {
      submitting = false;
    }
  }

  function getPropertyImage(item: Property): string {
    if (item.images && item.images.length > 0 && item.images[0]) {
      return item.images[0];
    }
    return item.imageUrl || DEFAULT_IMAGE;
  }

  function handleImageError(event: Event) {
    const target = event.target as HTMLImageElement;
    target.src = DEFAULT_IMAGE;
  }

  onMount(() => {
    trackEvent('PAGE_VIEW', { path: window.location.pathname });
  });
</script>

<svelte:head>
  <title>SpaceMatrix | Commercial Real Estate Portal</title>
</svelte:head>

<div class="app-layout">
  <header class="header">
    <div class="header-content">
      <h1>SpaceMatrix</h1>
      <p>Next-generation commercial space directory and leasing portal.</p>
    </div>
  </header>

  <main class="main-container">
    <!-- Category Tabs -->
    <div class="filter-tabs">
      {#each filterTabs as tab}
        <button
          class="tab-btn"
          class:active={data.selectedType === tab.value}
          on:click={() => setCategory(tab.value)}
        >
          {tab.label}
        </button>
      {/each}
    </div>

    <!-- Listings Grid -->
    {#if data.error}
      <div class="state-card error">
        <p>❌ {data.error}</p>
        <button on:click={() => window.location.reload()}>Retry Connection</button>
      </div>
    {:else if data.properties.length === 0}
      <div class="state-card">
        <p>No available spaces match this category.</p>
      </div>
    {:else}
      <div class="grid">
        {#each data.properties as item}
          <div class="card">
            <div class="card-image-container">
              <img 
                src={getPropertyImage(item)} 
                alt={item.name} 
                class="card-image"
                on:error={handleImageError}
              />
              <span class="badge {item.propertyType}">{item.propertyType}</span>
            </div>

            <div class="card-content">
              <div>
                <h2 class="card-title">{item.name}</h2>
                <p class="card-description">{item.description}</p>
              </div>

              <div>
                <div class="card-footer">
                  <div>
                    <span class="label">Monthly Rent</span>
                    <span class="price">${item.totalMonthlyRent ? item.totalMonthlyRent.toLocaleString() : 'N/A'}/mo</span>
                  </div>
                  {#if item.totalArea}
                    <div class="area-tag">
                      {item.totalArea.toLocaleString()} sq ft
                    </div>
                  {/if}
                </div>
                <button class="inquiry-btn" on:click={() => openInquiryModal(item)}>
                  Send Inquiry
                </button>
              </div>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </main>
</div>

<!-- Modal Popup -->
{#if activeProperty}
  <div class="modal-backdrop" on:click|self={closeModal} role="button" tabindex="0" on:keydown={(e) => e.key === 'Escape' && closeModal()}>
    <div class="modal-card">
      <button class="modal-close" on:click={closeModal}>&times;</button>
      
      <h3>Inquire About {activeProperty.name}</h3>
      <p class="modal-sub">Submit details directly to our leasing microservice network.</p>

      {#if submitSuccess}
        <div class="alert success">
          ✅ Inquiry processed & notifications dispatched! Closing...
        </div>
      {:else}
        {#if submitError}
          <div class="alert danger">❌ {submitError}</div>
        {/if}

        <form on:submit|preventDefault={handleInquirySubmit} class="inquiry-form">
          <div class="field">
            <label for="name">Your Full Name *</label>
            <input id="name" type="text" bind:value={formName} required placeholder="Jane Doe" />
          </div>

          <div class="field">
            <label for="email">Corporate Email *</label>
            <input id="email" type="email" bind:value={formEmail} required placeholder="jane@company.com" />
          </div>

          <div class="field">
            <label for="phone">Phone Number *</label>
            <input id="phone" type="tel" bind:value={formPhone} required placeholder="(555) 019-2834" />
          </div>

          <div class="field">
            <label for="message">Leasing Requirements *</label>
            <textarea id="message" bind:value={formMessage} rows="3" required></textarea>
          </div>

          <button type="submit" class="submit-btn" disabled={submitting}>
            {submitting ? 'Processing via Microservices...' : 'Submit Inquiry'}
          </button>
        </form>
      {/if}
    </div>
  </div>
{/if}

<style>
  .app-layout { min-height: 100vh; }

  .header {
    background: #0f172a;
    color: #ffffff;
    padding: 3.5rem 1.5rem;
    text-align: center;
  }

  .header-content h1 { margin: 0 0 0.5rem 0; font-size: 2.5rem; font-weight: 800; letter-spacing: -0.025em; }
  .header-content p { margin: 0; color: #94a3b8; font-size: 1.15rem; }

  .main-container {
    max-width: 1140px;
    margin: -1.75rem auto 3rem auto;
    padding: 0 1.5rem;
  }

  .filter-tabs {
    display: flex;
    gap: 0.5rem;
    background: #ffffff;
    padding: 0.5rem;
    border-radius: 12px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    margin-bottom: 2rem;
  }

  .tab-btn {
    flex: 1;
    padding: 0.75rem 1rem;
    border: none;
    background: transparent;
    border-radius: 8px;
    font-weight: 600;
    color: #64748b;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .tab-btn:hover { background: #f1f5f9; color: #0f172a; }
  .tab-btn.active { background: #2563eb; color: #ffffff; }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 1.5rem;
  }

  .card {
    background: #ffffff;
    border-radius: 12px;
    border: 1px solid #e2e8f0;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }

  .card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px -6px rgba(0, 0, 0, 0.12);
  }

  .card-image-container {
    position: relative;
    width: 100%;
    height: 190px;
    background-color: #f1f5f9;
  }

  .card-image { width: 100%; height: 100%; object-fit: cover; }

  .badge {
    position: absolute;
    top: 0.75rem; left: 0.75rem;
    padding: 0.3rem 0.75rem;
    border-radius: 9999px;
    font-size: 0.75rem; font-weight: 700;
    text-transform: uppercase;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
  }

  .badge.office { background: #dbeafe; color: #1e40af; }
  .badge.warehouse { background: #fef3c7; color: #92400e; }
  .badge.retail { background: #dcfce7; color: #166534; }

  .card-content {
    padding: 1.25rem;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    flex-grow: 1;
  }

  .card-title { font-size: 1.25rem; margin: 0 0 0.5rem 0; color: #0f172a; }
  .card-description { color: #64748b; font-size: 0.95rem; margin-bottom: 1.5rem; line-height: 1.4; }

  .card-footer {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    padding-top: 1rem;
    border-top: 1px solid #f1f5f9;
    margin-bottom: 1rem;
  }

  .label { font-size: 0.75rem; color: #94a3b8; text-transform: uppercase; display: block; }
  .price { font-size: 1.25rem; font-weight: 700; color: #0f172a; }
  .area-tag { font-size: 0.875rem; color: #475569; background: #f1f5f9; padding: 0.25rem 0.5rem; border-radius: 6px; }

  .inquiry-btn {
    width: 100%;
    padding: 0.75rem;
    background: #0f172a;
    color: #ffffff;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s;
  }

  .inquiry-btn:hover { background: #2563eb; }

  .modal-backdrop {
    position: fixed;
    top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(15, 23, 42, 0.6);
    backdrop-filter: blur(4px);
    display: flex; align-items: center; justify-content: center;
    z-index: 100;
  }

  .modal-card {
    background: #ffffff;
    border-radius: 12px;
    padding: 2rem;
    width: 90%; max-width: 480px;
    position: relative;
    box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);
  }

  .modal-close {
    position: absolute; top: 1rem; right: 1rem;
    background: none; border: none;
    font-size: 1.5rem; color: #64748b;
    cursor: pointer;
  }

  .modal-card h3 { margin: 0 0 0.25rem 0; font-size: 1.3rem; }
  .modal-sub { margin: 0 0 1.5rem 0; color: #64748b; font-size: 0.9rem; }

  .inquiry-form { display: flex; flex-direction: column; gap: 1rem; }
  .field { display: flex; flex-direction: column; gap: 0.35rem; text-align: left; }
  .field label { font-size: 0.85rem; font-weight: 600; color: #334155; }
  .field input, .field textarea {
    padding: 0.65rem;
    border: 1px solid #cbd5e1;
    border-radius: 6px;
    font-family: inherit;
  }

  .submit-btn {
    padding: 0.75rem;
    background: #2563eb;
    color: white;
    border: none;
    border-radius: 6px;
    font-weight: 600;
    cursor: pointer;
  }

  .alert { padding: 0.75rem; border-radius: 6px; font-weight: 500; text-align: center; }
  .alert.success { background: #dcfce7; color: #166534; }
  .alert.danger { background: #fee2e2; color: #991b1b; }

  .state-card {
    background: #ffffff;
    border-radius: 12px;
    padding: 3rem;
    text-align: center;
    border: 1px solid #e2e8f0;
    color: #64748b;
  }

  .state-card.error { color: #dc2626; }
</style>