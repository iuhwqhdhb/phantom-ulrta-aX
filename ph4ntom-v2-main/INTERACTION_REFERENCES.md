# Phantom mobile interaction research

## Supplied screen recording (15 October 2026)

The 42-second recording shows an Ethereum detail page with a full-width red 1D line chart, touch scrubbing with a vertical guide and dimmed future line, a candlestick toggle with right-hand price labels, switching to 1W and LIVE, and a fixed bottom Trade button. Trade opens a right-aligned stack of Long, Short, and Buy buttons. Buy ETH uses a price subtitle, large amount, Cash row, quick amount chips while the amount is zero, an action button above the number pad once an amount is entered, and Add Funds when the account lacks Cash. Add Funds offers Add Cash and Transfer Crypto; Add Cash has its own amount entry and review. These recorded visual and interaction details informed Build 143. Price values, holdings, and third-party payment terms in the recording are transient and are not copied as live data.

Research date: 14 October 2026. Compared with the supplied app after the Home icon update. The request's “chatts” is ambiguous, so this brief covers price charts and messaging chats.

## Findings and confidence

Current official help articles establish the buying steps. Official screenshots establish layouts and visible controls. They do not establish animation duration, easing curves, haptic patterns, or the exact appearance of every intermediate transaction state. The 2024 charts article is useful for interaction history, but its older navigation should not be mixed into the current layout.

## Buying a token

The current mobile sequence is: open an asset, choose its network variant if needed, select Buy (sometimes under Trade), select a payment asset, enter an amount, review the quote, and confirm. Cash is the default payment source. Holdings update after confirmation. [Official swap guide](https://help.phantom.com/articles/5985106844435)

The inspected Review screenshot shows a black full-screen layout, circular back and settings buttons, a large dollar amount, a Buy row with estimated token quantity and price, a Payment row, a Frequency row, and a wide lavender Confirm button at the bottom. The frequency picker is a rounded bottom sheet over a dimmed Review screen. That example documents a recurring purchase: its success banner must not be assumed to be the one-time trade success design. [Official Review and frequency screenshots](https://help.phantom.com/articles/53653245881235)

Trade details include quoted pricing, slippage, and price impact. Payment displays the payment method and applicable fees. Settings vary by route; Cash trades expose fewer controls. [Swap settings](https://help.phantom.com/articles/adjust-swap-settings-in-phantom-27085326202515)

Adding Cash is a separate flow: Add Cash, enter an amount, Review, inspect payment/provider/fees, then Confirm and complete checkout. A provider handoff can change the screens. [Add funds](https://help.phantom.com/articles/how-to-buy-crypto-in-phantom-4406543783571)

## Charts

The current official Position Detail screenshots show a large chart on black, green/red price movement, a highlighted endpoint on line charts, LIVE/1D/1W/1M/1Y/ALL selectors, and a line/candlestick toggle. Position information sits below, while relevant actions sit along the bottom. Some detailed trading charts include price labels, volume, and position-level markers; these should not be copied indiscriminately onto every spot chart. [Current asset-page reference](https://help.phantom.com/articles/52633747656211)

Phantom's older chart documentation explicitly supports inspecting prices at particular moments. It confirms interactive historical inspection, but does not establish today's exact touch gesture, tooltip animation, or haptic behavior. [Chart interaction documentation, June 2024](https://phantom.com/learn/blog/charts-in-phantom)

## Chats

Chats are market conversations associated with tokens, perps, and predictions. Entry points include Join Chat on an asset and avatar → Chats. Users can trade from chats and hold a message to react. Participation requires a username, a wallet balance of at least $1, and a Public or Private profile. [Official chat guide](https://help.phantom.com/articles/44454103123731)

The inspected Review article also shows a Live Chat preview on an asset page: a participant count and a rounded message preview. It does not show the complete chat room or composer, so those details remain unverified.

## Differences in your app

| Area | Observed in supplied code | Recommended correction |
| --- | --- | --- |
| Buy | `execTrade` immediately changes local holdings and opens the done screen. | Add a separate Review step, followed by explicit submitting, success, and failure states for the demo. |
| Payment selection | The “Pay with Cash” control switches amount units. | Separate payment selection from USD/token unit switching. |
| Swaps | `doSwap` calculates the output from displayed prices and instantly updates balances. | Give swaps the same quote/review/status sequence. |
| Chart history | Missing history can fall back to seeded generated candles even when only the current price is known. | Show unavailable history or clearly identify sample data. A known current price does not establish past prices. |
| Chart timestamps | The axis always displays the same five times. | Derive labels and scrub timestamps from the selected dataset and range. |
| Scrubbing | Both chart modes replace the header with OHLC values. | Use price/time for line charts; reserve OHLC details for candles. This is a proposed interaction choice pending a current recording. |
| Chats | Only an empty placeholder says chats appear when someone sends crypto. | Replace that explanation with the market-room model; a functional room still needs its own implementation. |

## Motion recommendations — estimates, not measured Phantom timings

Your app already has a 280 ms sheet entrance, 200 ms pop animation, and 120 ms button feedback. There is no evidence from this research that simply replacing these numbers would make it more accurate.

Suggested prototype targets:

- Keep sheet movement around 250–350 ms, with fast initial movement and a gentle stop. Animate dismissal as well as entry.
- Keep tap feedback around 100–140 ms. Disable repeat confirmation while an operation is pending.
- Show a loading state for the actual operation's lifetime; do not invent a fixed transaction duration.
- Update chart scrubbing immediately. Use a short 150–250 ms transition when changing ranges, without changing the meaning of historical data.
- Keep the total stable while refreshing. The spinning gear requested earlier is your customization; this research does not verify it as Phantom's native refresh indicator.
- Respect reduced-motion settings.

These are implementation starting points. Exact entrance/exit choreography, success transitions, chart morphing, and haptics require a current mobile recording with a known app version and device.

## Suggested implementation order

1. Review and confirmation flow, including proper payment selection.
2. Accurate chart timestamps and unavailable-history handling.
3. Consistent entrance, dismissal, pending, and completion transitions.
4. Market chat screens if messaging was intended.

No app code was changed during this research.
