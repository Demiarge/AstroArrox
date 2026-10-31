export function PlaceholderHelp() {
  const items = [
    ["{{deliveryTime}}", "Delivery time text"],
    ["{{insideDhakaFee}}", "Inside-Dhaka shipping fee"],
    ["{{outsideDhakaFee}}", "Outside-Dhaka shipping fee"],
    ["{{freeShippingThreshold}}", "Free-shipping threshold"],
  ];
  return (
    <div className="rounded-xl bg-subtle p-4 text-sm">
      <p className="font-medium">Placeholders</p>
      <p className="mt-1 text-muted">Type these and they’re replaced with the current value from Settings, so prices never go out of date.</p>
      <ul className="mt-3 space-y-1.5">
        {items.map(([code, label]) => (
          <li key={code} className="flex flex-wrap gap-x-2">
            <code className="rounded bg-surface px-1.5 py-0.5 font-mono text-xs">{code}</code>
            <span className="text-muted">{label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
