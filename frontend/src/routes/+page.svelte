<!-- frontend/src/routes/+page.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { SERVICES, type Property, type InquiryPayload } from '$lib';

  // Svelte 5 Runes prop declaration
  let { data }: { data: { properties: Property[]; selectedType: string; error?: string } } = $props();

  const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80';

  // Modal & Form State using Svelte 5 state runes
  let activeProperty = $state<Property | null>(null);
  let formName = $state('');
  let formEmail = $state('');
  let formPhone = $state('');
  let formMessage = $state('');
  let submitting = $state(false);
  let submitSuccess = $state(false);
  let submitError = $state<string | null>(null);

  const filterTabs = [
    { label: 'All Spaces', value: 'all' },
    { label: 'Office', value: 'office' },
    { label: 'Warehouse', value: 'warehouse' },
    { label: 'Retail', value: 'retail' }
  ];

  // Microservice 3: Analytics Event Tracker
  async function trackEvent(eventType: string, metadata = {}) {
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
    formMessage = `Hi, I am interested in leasing ${property.name}. Please contact me with details.`;
    submitSuccess = false;
    submitError = null;

    trackEvent('INQUIRY_MODAL_OPENED', { propertyId: property._id, propertyName: property.name });
  }

  function closeModal() {
    activeProperty = null;
  }

  // Combined Handler for Inquiry & Notification Microservices
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
      // 1. Submit to Inquiry Microservice (:3002)
      const inquiryRes = await fetch(SERVICES.INQUIRY, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!inquiryRes.ok) {
        const errData = await inquiryRes.json();
        throw new Error(errData.message || 'Failed to submit inquiry.');
      }

      // 2. Dispatch to Notification Microservice (:3004)
      fetch(`${SERVICES.NOTIFICATION}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'NEW_LEASING_INQUIRY',
          recipient: 'manager@spacematrix.com',
          details: payload
        })
      }).catch(err => console.warn('Notification service failed:', err));

      // 3. Log Analytics (:3003)
      trackEvent('INQUIRY_SUBMITTED_SUCCESS', { propertyId: activeProperty._id });

      submitSuccess = true;
      setTimeout(() => closeModal(), 2000);
    } catch (err: any) {
      console.error('Submission error:', err);
      submitError = err.message;
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

  onMount(() => {
    trackEvent('PAGE_VIEW', { path: window.location.pathname });
  });
</script>

<svelte:head>
  <title>SpaceMatrix | Commercial Spaces</title>
</svelte:head>

<main class="main-container">
  <!-- Filter Tabs -->
  <div class="filter-tabs">
    {#each filterTabs as tab}
      <button
        class="tab-btn"
        class:active={data.selectedType === tab.value}
        onclick={() => setCategory(tab.value)}
      >
        {tab.label}
      </button>
    {/each}
  </div>

  <!-- Content State -->
  {#if data.error}
    <div class="state-card error">
      <p>❌ {data.error}</p>
      <button onclick={() => window.location.reload()}>Retry Connection</button>
    </div>
  {:else if !data.properties || data.properties.length === 0}
    <div class="state-card">
      <p>No available spaces match this category.</p>
    </div>
  {:else}
    <!-- Property Cards Grid -->
    <div class="grid">
      {#each data.properties as item}
        <div class="card">
          <div class="card-image-container">
            <img src={getPropertyImage(item)} alt={item.name} class="card-image" />
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
                  <div class="area-tag">{item.totalArea.toLocaleString()} sq ft</div>
                {/if}
              </div>
              <button class="inquiry-btn" onclick={() => openInquiryModal(item)}>
                Send Inquiry
              </button>
            </div>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</main>

<!-- Modal -->
{#if activeProperty}
  <div 
    class="modal-backdrop" 
    onclick={(e) => e.target === e.currentTarget && closeModal()} 
    onkeydown={(e) => e.key === 'Escape' && closeModal()}
    role="button"
    tabindex="0"
  >
    <div class="modal-card">
      <button class="modal-close" onclick={closeModal}>&times;</button>
      <h3>Inquire About {activeProperty.name}</h3>
      <p class="modal-sub">Submit details directly to our leasing network.</p>

      {#if submitSuccess}
        <div class="alert success">✅ Inquiry processed & notifications sent! Closing...</div>
      {:else}
        {#if submitError}<div class="alert danger">❌ {submitError}</div>{/if}

        <form onsubmit={(e) => { e.preventDefault(); handleInquirySubmit(); }} class="inquiry-form">
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
            {submitting ? 'Processing...' : 'Submit Inquiry'}
          </button>
        </form>
      {/if}
    </div>
  </div>
{/if}

<style>
  .main-container {
    max-width: 1140px;
    margin: -1.5rem auto 3rem auto;
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
    transition: all 0.2s;
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
  }

  .card-image-container { position: relative; height: 190px; background: #f1f5f9; }
  .card-image { width: 100%; height: 100%; object-fit: cover; }

  .badge {
    position: absolute; top: 0.75rem; left: 0.75rem;
    padding: 0.3rem 0.75rem; border-radius: 9999px;
    font-size: 0.75rem; font-weight: 700; text-transform: uppercase;
  }
  .badge.office { background: #dbeafe; color: #1e40af; }
  .badge.warehouse { background: #fef3c7; color: #92400e; }
  .badge.retail { background: #dcfce7; color: #166534; }

  .card-content { padding: 1.25rem; display: flex; flex-direction: column; justify-content: space-between; flex-grow: 1; }
  .card-title { font-size: 1.25rem; margin: 0 0 0.5rem 0; color: #0f172a; }
  .card-description { color: #64748b; font-size: 0.95rem; margin-bottom: 1.5rem; line-height: 1.4; }

  .card-footer { display: flex; justify-content: space-between; align-items: flex-end; padding-top: 1rem; border-top: 1px solid #f1f5f9; margin-bottom: 1rem; }
  .label { font-size: 0.75rem; color: #94a3b8; text-transform: uppercase; display: block; }
  .price { font-size: 1.25rem; font-weight: 700; color: #0f172a; }
  .area-tag { font-size: 0.875rem; color: #475569; background: #f1f5f9; padding: 0.25rem 0.5rem; border-radius: 6px; }

  .inquiry-btn {
    width: 100%; padding: 0.75rem; background: #0f172a; color: #ffffff;
    border: none; border-radius: 8px; font-weight: 600; cursor: pointer;
  }
  .inquiry-btn:hover { background: #2563eb; }

  .modal-backdrop {
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(15, 23, 42, 0.6); display: flex; align-items: center; justify-content: center; z-index: 100;
  }

  .modal-card {
    background: #ffffff; border-radius: 12px; padding: 2rem;
    width: 90%; max-width: 480px; position: relative;
  }

  .modal-close { position: absolute; top: 1rem; right: 1rem; background: none; border: none; font-size: 1.5rem; cursor: pointer; }
  .modal-card h3 { margin: 0 0 0.25rem 0; }
  .modal-sub { margin: 0 0 1.5rem 0; color: #64748b; font-size: 0.9rem; }

  .inquiry-form { display: flex; flex-direction: column; gap: 1rem; }
  .field { display: flex; flex-direction: column; gap: 0.35rem; }
  .field input, .field textarea { padding: 0.65rem; border: 1px solid #cbd5e1; border-radius: 6px; }

  .submit-btn { padding: 0.75rem; background: #2563eb; color: white; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; }

  .alert { padding: 0.75rem; border-radius: 6px; font-weight: 500; text-align: center; }
  .alert.success { background: #dcfce7; color: #166534; }
  .alert.danger { background: #fee2e2; color: #991b1b; }

  .state-card { background: #ffffff; border-radius: 12px; padding: 3rem; text-align: center; border: 1px solid #e2e8f0; color: #64748b; }
</style>