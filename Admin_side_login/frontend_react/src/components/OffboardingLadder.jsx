import React, { useState, useEffect } from 'react';
import StepRung from './StepRung';
import ClientSelectDropdown from './ClientSelectDropdown';
import { fetchOffboardingState } from '../services/api';

function formatDate(dateVal) {
  if (!dateVal) return 'N/A';
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return dateVal;
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

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

  const totalSteps = steps.length || 3;
  const doneCount = steps.filter(s => s.done).length;
  const inProgressStep = steps.find(s => s.inProgress);
  const activeStepNum = inProgressStep ? `Step ${inProgressStep.step_number || inProgressStep.id}` : (doneCount === totalSteps ? 'Complete' : '—');
  const activeStepTitle = inProgressStep ? inProgressStep.title : (doneCount === totalSteps ? `All ${totalSteps} Steps Complete` : '—');
  const stageName = client.stage === 'offboarded' ? 'Offboarded' : 'Offboarding Pending';

  return (
    <section className="view on" id="v-offboard">
      <div className="hdr-row">
        <div>
          <div className="eyebrow" id="ob-eyebrow">Lifecycle Termination</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '2px 0 4px' }}>
            <ClientSelectDropdown
              id="client-select-hdr"
              clients={clients}
              value={client.id}
              onChange={(value) => onSelectClient(value)}
            />
            <h1 id="ob-title" style={{ margin: 0 }}>Offboarding Workflow</h1>
            {client.stage === 'offboarded' && <span className="tag ok" style={{ fontSize: '11px', padding: '2px 8px', marginLeft: '8px' }}>Offboarded</span>}
          </div>
          <p className="sub">Cryptographic key destruction and certified data return upon client contract conclusion.</p>
        </div>
      </div>

      <div className="metrics">
        <div className="metric">
          <div className="v" id="m-complete">{doneCount} / {totalSteps}</div>
          <div className="l">Steps Complete</div>
          <div className="d" id="m-started">Started — {formatDate(client.created_at || new Date().toISOString())}</div>
        </div>
        <div className="metric">
          <div className="v" id="m-waiting">{activeStepNum}</div>
          <div className="l">Active Action</div>
          <div className="d" id="m-waiting-d">{activeStepTitle}</div>
        </div>
        <div className="metric">
          <div className="v" id="m-pct">{totalSteps > 0 ? Math.round((doneCount / totalSteps) * 100) : 0}%</div>
          <div className="l">Completion</div>
          <div className="d" id="m-stage">Stage: {stageName}</div>
        </div>
        <div className="metric">
          <div className="v" id="m-move">{formatDate(client.updated_at || new Date().toISOString())}</div>
          <div className="l">Last Activity</div>
          <div className="d" id="m-move-d">Activity logged</div>
        </div>
      </div>

      <div className="ladder" id="ladder">
        <div className="phase">
          OFFBOARDING PROCEDURES
        </div>
        {steps.map(step => (
          <StepRung
            key={step.step_key || step.id}
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
