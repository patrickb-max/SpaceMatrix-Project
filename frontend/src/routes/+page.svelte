<script lang="ts">
  import { SERVICES, type Property, type InquiryPayload } from '$lib';

  // Svelte 5 Runes syntax for props
  let { data } = $props<{
    data: {
      properties: Property[];
      selectedType: string;
      error?: string;
    }
  }>();

  let submitting = $state(false);
  let formSuccess = $state(false);
  let selectedProperty = $state<Property | null>(null);

  let inquiry = $state<InquiryPayload>({
    propertyId: null,
    propertyName: '',
    inquirerName: '',
    inquirerEmail: '',
    phone: '',
    message: ''
  });

  function openInquiryModal(prop: Property) {
    selectedProperty = prop;
    inquiry.propertyId = prop._id || null;
    inquiry.propertyName = prop.name;
    formSuccess = false;
  }

  async function submitInquiry(e: Event) {
    e.preventDefault();
    submitting = true;

    try {
      const res = await fetch(SERVICES.INQUIRY, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inquiry)
      });

      if (!res.ok) throw new Error('Failed to submit inquiry');

      // Dispatch notification
      await fetch(`${SERVICES.NOTIFICATION}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'NEW_INQUIRY',
          recipient: 'admin@spacematrix.com',
          details: inquiry
        })
      });

      formSuccess = true;
      inquiry = {
        propertyId: null,
        propertyName: '',
        inquirerName: '',
        inquirerEmail: '',
        phone: '',
        message: ''
      };
    } catch (err) {
      alert('Could not submit inquiry. Please try again.');
    } finally {
      submitting = false;
    }
  }
</script>

<header class="header">
  <h1>SpaceMatrix Commercial Hub</h1>
  <p>Find & lease premium workspace, warehouses, and retail hubs.</p>
</header>

{#if data.error}
  <div class="error-banner">
    ⚠️ {data.error}
  </div>
{/if}

<section class="filters">
  <a href="/" class:active={data.selectedType === 'all'}>All Spaces</a>
  <a href="/?type=office" class:active={data.selectedType === 'office'}>Offices</a>
  <a href="/?type=warehouse" class:active={data.selectedType === 'warehouse'}>Warehouses</a>
  <a href="/?type=retail" class:active={data.selectedType === 'retail'}>Retail</a>
</section>

<section class="grid">
  {#each data.properties as prop}
    <div class="card">
      <div class="badge">{prop.propertyType.toUpperCase()}</div>
      <h3>{prop.name}</h3>
      <p>{prop.description}</p>
      
      <div class="details">
        <div><strong>Area:</strong> {prop.totalArea.toLocaleString()} sq ft</div>
        <div><strong>Rate:</strong> ${prop.rentPerSqFt}/sq ft</div>
        <div><strong>Monthly:</strong> ${prop.totalMonthlyRent.toLocaleString()}/mo</div>
      </div>

      <button class="btn" onclick={() => openInquiryModal(prop)}>Inquire Now</button>
    </div>
  {:else}
    <div class="empty">
      <p>No properties found in this category.</p>
    </div>
  {/each}
</section>

{#if selectedProperty}
  <div class="modal-backdrop" onclick={() => (selectedProperty = null)}>
    <div class="modal" onclick={(e) => e.stopPropagation()}>
      <h2>Inquire: {selectedProperty.name}</h2>

      {#if formSuccess}
        <div class="success-msg">
          ✅ Thank you! Your inquiry has been sent to our space advisors.
        </div>
        <button class="btn-secondary" onclick={() => (selectedProperty = null)}>Close</button>
      {:else}
        <form onsubmit={submitInquiry}>
          <label>
            Full Name
            <input type="text" bind:value={inquiry.inquirerName} required />
          </label>
          <label>
            Email Address
            <input type="email" bind:value={inquiry.inquirerEmail} required />
          </label>
          <label>
            Phone
            <input type="tel" bind:value={inquiry.phone} required />
          </label>
          <label>
            Message / Requirements
            <textarea bind:value={inquiry.message} rows="3" required></textarea>
          </label>

          <div class="actions">
            <button type="button" class="btn-secondary" onclick={() => (selectedProperty = null)}>Cancel</button>
            <button type="submit" class="btn" disabled={submitting}>
              {submitting ? 'Sending...' : 'Submit Inquiry'}
            </button>
          </div>
        </form>
      {/if}
    </div>
  </div>
{/if}

<style>
  .header { margin-bottom: 2rem; }
  .header h1 { margin: 0; font-size: 2.2rem; color: #0f172a; }
  .header p { color: #64748b; margin-top: 0.5rem; }

  .error-banner {
    background: #fef2f2;
    border: 1px solid #fca5a5;
    color: #991b1b;
    padding: 1rem;
    border-radius: 8px;
    margin-bottom: 1.5rem;
  }

  .filters { display: flex; gap: 0.75rem; margin-bottom: 2rem; }
  .filters a {
    text-decoration: none;
    padding: 0.5rem 1.25rem;
    background: #e2e8f0;
    color: #334155;
    border-radius: 20px;
    font-weight: 500;
  }
  .filters a.active { background: #2563eb; color: #fff; }

  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem; }
  .card {
    background: #fff;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 1.5rem;
    position: relative;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  }
  .badge {
    display: inline-block;
    background: #dbeafe;
    color: #1e40af;
    font-size: 0.75rem;
    font-weight: 700;
    padding: 0.25rem 0.6rem;
    border-radius: 4px;
    margin-bottom: 0.5rem;
  }
  .card h3 { margin: 0 0 0.5rem 0; color: #1e293b; }
  .card p { color: #64748b; font-size: 0.95rem; line-height: 1.4; }

  .details {
    margin: 1rem 0;
    padding: 0.75rem;
    background: #f8fafc;
    border-radius: 6px;
    font-size: 0.9rem;
    color: #475569;
  }

  .btn {
    width: 100%;
    background: #2563eb;
    color: #fff;
    border: none;
    padding: 0.75rem;
    border-radius: 6px;
    font-weight: 600;
    cursor: pointer;
  }
  .btn:hover { background: #1d4ed8; }

  .btn-secondary {
    background: #e2e8f0;
    color: #334155;
    border: none;
    padding: 0.75rem 1rem;
    border-radius: 6px;
    font-weight: 600;
    cursor: pointer;
  }

  .modal-backdrop {
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(15, 23, 42, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 50;
  }
  .modal {
    background: #fff;
    padding: 2rem;
    border-radius: 12px;
    width: 100%;
    max-width: 450px;
  }
  .modal h2 { margin-top: 0; }
  form label { display: block; margin-bottom: 1rem; font-size: 0.9rem; color: #334155; }
  form input, form textarea {
    width: 100%;
    padding: 0.5rem;
    margin-top: 0.3rem;
    border: 1px solid #cbd5e1;
    border-radius: 6px;
    box-sizing: border-box;
  }
  .actions { display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1.5rem; }
  .success-msg { color: #166534; background: #f0fdf4; padding: 1rem; border-radius: 6px; margin-bottom: 1rem; }
  .empty { grid-column: 1 / -1; text-align: center; color: #94a3b8; padding: 3rem; }
</style>