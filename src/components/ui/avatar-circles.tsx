import { cn } from "../../utils/cn"

interface Avatar {
  imageUrl: string
  profileUrl: string
}
interface AvatarCirclesProps {
  className?: string
  numPeople?: number
  avatarUrls: Avatar[]
}

export const AvatarCircles = ({
  numPeople,
  className,
  avatarUrls,
}: AvatarCirclesProps) => {
  return (
    <div className={cn("z-10 flex -space-x-4 rtl:space-x-reverse", className)}>
      {avatarUrls.map((url, index) => (
        <a
          key={index}
          href={url.profileUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            key={index}
            className="h-14 w-14 rounded-full border-[3px] border-[var(--color-gunmetal)] bg-white object-cover"
            src={url.imageUrl}
            width={56}
            height={56}
            alt={`Avatar ${index + 1}`}
          />
        </a>
      ))}
      {(numPeople ?? 0) > 0 && (
        <a
          className="flex h-14 w-14 items-center justify-center rounded-full border-[3px] border-[var(--color-gunmetal)] bg-[var(--color-almond-silk)] text-center text-sm font-bold text-[var(--color-gunmetal)] hover:-translate-y-1 hover:shadow-[2px_2px_0px_var(--color-gunmetal)] transition-all"
          href="#watch-party"
        >
          +{numPeople}
        </a>
      )}
    </div>
  )
}
