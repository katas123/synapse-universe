import { Orbit } from 'lucide-react';
export default function Brand() {
  return (
    <div className="brand">
      <span className="brand-icon">
        <Orbit size={25} />
      </span>
      <span>
        SYNAPSE<span className="brand-sub">UNIVERSE</span>
      </span>
    </div>
  );
}
