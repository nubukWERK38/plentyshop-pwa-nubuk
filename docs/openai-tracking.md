# OpenAI Ads: Kaufmessung für Nubuk

Die PWA lädt das Measurement Pixel erst nach der separaten Einwilligung „OpenAI Ads“ im bestehenden Cookie-Banner. Vorhandene Google-Einwilligungen werden dafür nicht übernommen. Der neue Cookie-Konfigurationseintrag führt bei bisherigen Besuchern zur erneuten Anzeige der Auswahl.

Die Bestellbestätigung sendet `order_created` an das vorhandene Nubuk-Pixel. Grundlage ist die tatsächliche Bestellung, nicht der Produktfeed:

- `amount`: `totals.totalGross`, in die kleinste Währungseinheit umgerechnet; bei EUR also Cent. Der Bruttogesamtwert enthält die in der Bestellung berücksichtigten Steuern, Versandkosten und Rabatte.
- `currency`: Bestellwährung.
- `contents`: Varianten-IDs passend zu den Feed-IDs sowie ganze Stückzahlen; Versand- und Gutscheinpositionen werden ausgeschlossen.
- `event_id`: `nubuk_order_<Bestell-ID>`. Wiederholte Aufrufe werden im laufenden Browser-Kontext und in der Sitzung unterdrückt. Die stabile ID kann später auch zur Deduplizierung mit Server-Ereignissen verwendet werden.
- `opt_out: true`: Opt-out für eine mögliche zukünftige personenbezogene Personalisierung nach SDK-Spezifikation.

Es werden keine zusätzlichen Kundendatenfelder wie E-Mail oder Telefonnummer von dieser Integration übergeben. Kontoabhängige Einstellungen des OpenAI-Pixels, insbesondere automatisches Advanced Matching, müssen separat im Ads Manager geprüft werden.

Die Attribution bleibt bei Seitenwechseln mit gespeicherter Einwilligung erhalten. Beim Widerruf wird das SDK gesperrt; `__oppref` und `__obref` werden entfernt. Die Cookie-Auswahl wird vor einem erforderlichen Seitenneuladen synchron gespeichert, damit ein Widerruf nicht verloren geht.

## Konfiguration

Öffentliche Runtime-Konfiguration:

- `NUXT_PUBLIC_ENABLE_OPENAI_TRACKING=false` deaktiviert die Anbindung.
- `NUXT_PUBLIC_OPENAI_PIXEL_ID` überschreibt die vorhandene Nubuk-Pixel-ID.

Ein API-Schlüssel ist für das Browser-Pixel nicht erforderlich. Eine serverseitige Conversions-API-Anbindung ist in dieser Änderung nicht enthalten. Deren Schlüssel darf ausschließlich serverseitig gespeichert werden.

## Tests

Aus dem Repository-Hauptverzeichnis:

```powershell
node node_modules/vitest/vitest.mjs run --config apps/web/vitest.tracking.config.ts
```

Die Suite prüft Wertumrechnung, fehlende/ungültige Bestellungen, Ausschluss von Retouren, Einwilligung, Widerruf während des Ladens, SDK-Fehler, gesperrten Browser-Speicher und Doppelzählung. Bestehendes GTM- und billiger.de-Tracking läuft als Regression mit.

Lokale Browser-Prüfungen verwenden abgefangene SDK-Aufrufe und lösen keine echten Bestellungen oder OpenAI-Conversions aus. Sie ersetzen den Empfangstest nach der Bereitstellung nicht.

## Aktivierung und Empfangstest

1. Geprüften Stand in der PlentyONE-Shop-Verwaltung für „Nubuk Bikes“ bereitstellen.
2. Im OpenAI Ads Manager die vorhandene Conversion „Purchase“ mit Basisereignis `order_created` und Pixel „Nubuk Bikes“ verwenden. Am 23.10.2026 zeigt die übermittelte Kontomaske bereits eine Kampagnenzuordnung.
3. Auf der veröffentlichten Shop-Version prüfen: ohne Zustimmung keine SDK-Anfrage; nach Zustimmung Pixel aktiv; nach Widerruf auch nach Neuladen gesperrt.
4. Eine abgestimmte echte Testbestellung durchführen und deren Eingang, Bestellwert und Währung im Ereignisstream kontrollieren. Die lokalen synthetischen Ereignisse wurden nicht an OpenAI gesendet.
5. Vor Kampagnenstart die Zuordnung zur gewünschten Kampagne und die Datenschutzinformationen des Shops prüfen.

## Quellen

- [Measurement Pixel](https://developers.openai.com/ads/measurement-pixel)
- [Conversion Tracking](https://developers.openai.com/ads/conversion-tracking)
- [Supported Events und Wertformat](https://developers.openai.com/ads/supported-events)
