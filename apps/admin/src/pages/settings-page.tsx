import { Button } from "@workspace/ui/components/button"
import { Plus } from "lucide-react"
import { useEffect, useRef, useState } from "react"

import { AdminPageHeader } from "@/components/admin-page-header"
import { AccountCard } from "@/components/settings/account-card"
import { LocationDialog } from "@/components/settings/location-dialog"
import { SettingsTabs } from "@/components/settings/settings-tabs"
import { ShopHoursCard } from "@/components/settings/shop-hours-card"
import { ShopInfoCard } from "@/components/settings/shop-info-card"
import { TeamCard } from "@/components/settings/team-card"
import {
  SHOP_HOURS_MOCK,
  nameFromEmail,
  settingsSectionId,
  shopInfoFromMock,
  teamFromMock,
  type SettingsSection,
  type ShopInfo,
  type TeamMember,
  type TeamRole,
} from "@/lib/settings"
import { formatClockTime } from "@/lib/yangon-time"

/**
 * Settings (`/settings`), the shop profile, hours, team and account in one
 * screen.
 *
 * The whole page is local state: there is no `GET/POST /api/settings` yet, so
 * the profile, roster and opening hours start from the mocks in
 * `lib/settings.ts` and every edit — a field, an invite, a removed teammate, a
 * new map pin — lives here until "Save settings" is pressed. Saving only stamps
 * the time, which is what the subtitle reports.
 *
 * The design's "Sample admin by [Your Name]" footer is omitted: the shell owns
 * that chrome on every screen.
 */
export function SettingsPage() {
  const [shop, setShop] = useState<ShopInfo>(shopInfoFromMock)
  const [team, setTeam] = useState<TeamMember[]>(teamFromMock)
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [savedAt, setSavedAt] = useState<Date | null>(null)
  const [active, setActive] = useState<SettingsSection>("shop")
  const [locationOpen, setLocationOpen] = useState(false)

  const logoUrls = useRef<string[]>([])

  // A picked logo is an object URL owned by this page; without this the blob
  // would stay alive for the whole tab session after navigating away.
  useEffect(
    () => () => {
      for (const url of logoUrls.current) URL.revokeObjectURL(url)
    },
    []
  )

  function pickLogo(file: File) {
    if (!file.type.startsWith("image/")) return

    if (logoUrl) {
      URL.revokeObjectURL(logoUrl)
      logoUrls.current = logoUrls.current.filter((url) => url !== logoUrl)
    }

    const url = URL.createObjectURL(file)
    logoUrls.current.push(url)
    setLogoUrl(url)
  }

  function inviteMember(email: string, role: TeamRole) {
    setTeam((current) => [
      ...current,
      {
        id: email,
        name: nameFromEmail(email),
        email,
        role,
        lastLogin: "Invited just now",
      },
    ])
  }

  function removeMember(id: string) {
    setTeam((current) => current.filter((member) => member.id !== id))
  }

  function selectSection(section: SettingsSection) {
    setActive(section)
    document
      .getElementById(settingsSectionId(section))
      ?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  return (
    <>
      <AdminPageHeader
        title="ဆက်တင်များ"
        subtitle={
          savedAt
            ? `Settings • Asia/Yangon • saved ${formatClockTime(savedAt)} Yangon`
            : "Settings • Asia/Yangon"
        }
        actions={
          <Button
            onClick={() => setSavedAt(new Date())}
            className="min-h-12 gap-2 px-5 text-sm font-bold"
          >
            <Plus className="size-4" strokeWidth={3} />
            Save settings
          </Button>
        }
      />

      <main className="flex flex-1 flex-col gap-4 px-4 py-5 sm:px-6">
        <SettingsTabs active={active} onSelect={selectSection} />

        <div className="grid items-start gap-4 lg:grid-cols-2">
          <div className="flex flex-col gap-4">
            <ShopInfoCard
              info={shop}
              logoUrl={logoUrl}
              onChange={(patch) =>
                setShop((current) => ({ ...current, ...patch }))
              }
              onPickLogo={pickLogo}
              onSetLocation={() => setLocationOpen(true)}
            />
            <ShopHoursCard hours={SHOP_HOURS_MOCK} />
          </div>

          <div className="flex flex-col gap-4">
            <TeamCard
              members={team}
              onInvite={inviteMember}
              onRemove={removeMember}
            />
            <AccountCard />
          </div>
        </div>
      </main>

      {locationOpen ? (
        <LocationDialog
          lat={shop.lat}
          lng={shop.lng}
          onOpenChange={setLocationOpen}
          onSave={(lat, lng) => {
            setShop((current) => ({ ...current, lat, lng }))
            setLocationOpen(false)
          }}
        />
      ) : null}
    </>
  )
}
