export default function UpNextToast({ 
  nextSongTitle, 
  isVisible 
}: { 
  nextSongTitle: string, 
  isVisible: boolean 
}) {
  return (
    <div className={`up-next-toast ${isVisible ? 'visible' : ''}`}>
      <span className="up-next-toast__label">Up Next</span>
      <span className="up-next-toast__title">{nextSongTitle}</span>
    </div>
  )
}
