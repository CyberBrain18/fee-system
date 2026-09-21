function initials(name: string) {
  return name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase();
}

function Avatar({ name, className = '' }: { name: string; className?: string }) {
  return (
    <div className={`rounded-full bg-[#2A78D6] text-white flex items-center justify-center font-display font-semibold ${className}`}>
      {initials(name)}
    </div>
  );
}

export default Avatar;
