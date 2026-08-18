import React, { useState, useEffect } from 'react';
import StepRung from './StepRung';
import ClientSelectDropdown from './ClientSelectDropdown';
import { fetchOffboardingState } from '../services/api';

export default function OffboardingLadder({ client, clients, onSelectClient, onRefresh, onOpenNotes, onOpenRedo }) {
  const [steps, setSteps] = useState([]);
  
  useEffect(() => {
    if (client?.id) {
      loadState();
    }
  }, [client?.id]);

  const loadState = async () => {
    try {
      const data = await fetchOffboardingState(client.id);
      setSteps(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleRefresh = () => {
    loadState();
    if (onRefresh) onRefresh();
  };

  if (!client) {
    return (
      <section className="view on" id="v-offboard">
        <div className="eyebrow">Lifecycle Termination</div>
        <h1>Offboarding Procedures</h1>
        <p className="sub">Cryptographic key destruction and certified data return upon client contract conclusion.</p>
        <div style={{ marginTop: '24px' }}>
          <ClientSelectDropdown clients={clients} onSelectClient={onSelectClient} activeClientId="" />
        </div>
        <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--ink-3)', background: 'var(--bg-2)', borderRadius: '12px', marginTop: '24px' }}>
          Please select a client to begin or review offboarding procedures.
        </div>
      </section>
    );
  }

  const handleStepAction = async (step, actionType, payload) => {
    // Basic actions handled locally if needed, mostly handled by StepRung
  };

  return (
    <section className="view on" id="v-offboard">
      <div className="hdr-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div className="eyebrow">Lifecycle Termination</div>
          <h1 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
            Offboarding: {client.name}
            {client.stage === 'offboarded' && <span className="tag ok" style={{ fontSize: '11px', padding: '2px 8px' }}>Offboarded</span>}
          </h1>
          <p className="sub">Cryptographic key destruction and certified data return upon client contract conclusion.</p>
        </div>
        <div style={{ minWidth: '320px' }}>
          <ClientSelectDropdown clients={clients} onSelectClient={onSelectClient} activeClientId={client.id} />
        </div>
      </div>

      <div className="ladder">
        {steps.map(step => (
          <StepRung
            key={step.step_key}
            clientId={client.id}
            step={step}
            onRefresh={handleRefresh}
            onOpenNotes={onOpenNotes}
            onOpenRedo={onOpenRedo}
            isOffboarding={true}
          />
        ))}
      </div>
    </section>
  );
}
