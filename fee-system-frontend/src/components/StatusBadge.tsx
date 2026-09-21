function StatusBadge({ paid }: { paid: boolean }) {
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
      paid ? 'bg-[#558A42]/10 text-[#558A42]' : 'bg-[#B3261E]/10 text-[#B3261E]'
    }`}>
      {paid ? 'Paid' : 'Due'}
    </span>
  );
}

export default StatusBadge;
