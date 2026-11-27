import { Button } from "@workspace/ui/components/button"
import { Plus } from "lucide-react"
import { useEffect, useRef, useState } from "react"

import { useSession } from "@/auth/session-context"
import { AdminPageHeader } from "@/components/admin-page-header"
import { FormAlert } from "@/components/form-alert"
import { AccountCard } from "@/components/settings/account-card"
import { LocationDialog } from "@/components/settings/location-dialog"
import { SettingsTabs } from "@/components/settings/settings-tabs"
import { ShopHoursCard } from "@/components/settings/shop-hours-card"
import { ShopInfoCard } from "@/components/settings/shop-info-card"
import { TeamCard, type InviteOutcome } from "@/components/settings/team-card"
import { TableSkeleton } from "@/components/states/dashboard-skeleton"
import { RequestError } from "@/components/states/request-error"
import { useStaff } from "@/hooks/use-staff"
import { ApiError, staffApi } from "@/lib/api"
import {
  SHOP_HOURS_MOCK,
  nameFromEmail,
  settingsSectionId,
  shopInfoFromMock,
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
 * The shop profile, logo and opening hours are still local state: there is no
 * `GET/POST /api/settings` yet, so they start from the mocks in
 * `lib/settings.ts` and every edit lives here until "Save settings" is pressed.
 * The team is real: it reads `GET /api/admin/staff`, and invites, role changes
 * and removals write through the API and refetch.
 *
 * The design's "Sample admin by [Your Name]" footer is omitted: the shell owns
 * that chrome on every screen.
 */
export function SettingsPage() {
  const { user } = useSession()
  const { staff, error, loading, reload } = useStaff()
  const [shop, setShop] = useState<ShopInfo>(shopInfoFromMock)
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [savedAt, setSavedAt] = useState<Date | null>(null)
  const [active, setActive] = useState<SettingsSection>("shop")
  const [locationOpen, setLocationOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

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

  async function inviteMember(
    email: string,
    role: TeamRole
  ): Promise<InviteOutcome> {
    setSaving(true)
    setActionError(null)

    try {
      const { temporaryPassword } = await staffApi.invite({
        email,
        // The invite panel only collects an email; the API needs a name to
        // show until the teammate changes it.
        name: nameFromEmail(email),
        role,
      })

      reload()
      return { ok: true, temporaryPassword }
    } catch (failure) {
      return {
        ok: false,
        message:
          failure instanceof ApiError
            ? failure.message
            : "Something went wrong. Please try again.",
      }
    } finally {
      setSaving(false)
    }
  }

  /** Runs a write, reports a failure, then refetches the roster. */
  async function run(action: () => Promise<unknown>) {
    setSaving(true)
    setActionError(null)

    try {
      await action()
      return true
    } catch (failure) {
      setActionError(
        failure instanceof ApiError
          ? failure.message
          : "Something went wrong. Please try again."
      )
      return false
    } finally {
      setSaving(false)
      reload()
    }
  }

  function changeRole(member: TeamMember, role: TeamRole) {
    return run(() => staffApi.update(member.id, { role }))
  }

  function removeMember(member: TeamMember) {
    return run(() => staffApi.remove(member.id))
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

        {actionError ? (
          <FormAlert
            title="မအောင်မြင်ပါ • Action failed"
            detail={actionError}
          />
        ) : null}

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
            {error ? (
              <RequestError
                detail={error instanceof ApiError ? error.message : undefined}
                onRetry={reload}
              />
            ) : loading ? (
              <TableSkeleton rows={3} className="rounded-lg" />
            ) : (
              <TeamCard
                members={staff ?? []}
                currentUserId={user?.id ?? ""}
                busy={saving}
                onInvite={inviteMember}
                onChangeRole={changeRole}
                onRemove={removeMember}
              />
            )}
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
