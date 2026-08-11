# MBA Cohort Event Dashboard

A lightweight, mobile-first calendar for sharing upcoming MBA cohort events. The dashboard reads approved events from a Google Sheet published as CSV, so it works as a static site with no backend or login.

## 1. Configure the two links

Create a `.env` file in the project root with:

```bash
VITE_SHEET_CSV_URL=https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/gviz/tq?tqx=out:csv&sheet=Events
VITE_GOOGLE_FORM_URL=https://docs.google.com/forms/d/YOUR_FORM_ID/viewform
```

The dashboard also contains clearly labeled fallback placeholders for both values. Replace those directly if you prefer not to use environment variables.

## 2. Publish the Events tab as CSV

1. Create a Google Sheet with an `Events` tab containing: `Event Name`, `Date`, `Time`, `Category`, `Description`, and `Link`.
2. Use `Link` for an optional full URL. When populated, the dashboard shows an **Open Link** button that opens in a new tab.
3. Format dates as `YYYY-MM-DD` and times as `HH:MM` in 24-hour time.
4. In Google Sheets, choose **File → Share → Publish to web**.
5. Select the `Events` tab and choose **CSV**, then publish it.
6. Copy the published CSV URL into `VITE_SHEET_CSV_URL`.

The app filters out past dates, ignores empty rows, and sorts events chronologically. CSV fields with commas, quotes, or line breaks are supported.

## 3. Connect the Google Form

1. Create a Google Form with `Event Name`, `Date`, `Time`, `Category`, `Description`, and optional `Link` fields.
2. In the Form’s Responses tab, link responses to the same Google Sheet.
3. Keep responses in a separate `Submissions` tab. Add a `Status` column with `Pending`, `Approved`, or `Rejected` values.
4. Turn on **Responses → Get email notifications for new responses**.
5. Review new submissions and manually copy approved rows into the `Events` tab.
6. Copy the Form’s public response URL into `VITE_GOOGLE_FORM_URL`.

## 4. Run and deploy

Install dependencies and run the Vite app locally with the standard project scripts. For Vercel:

1. Push this project to a GitHub repository.
2. Import the repository into Vercel.
3. Add `VITE_SHEET_CSV_URL` and `VITE_GOOGLE_FORM_URL` under the project’s Environment Variables.
4. Deploy. Future pushes will redeploy automatically.

No Google API key, serverless function, authentication, or database is required.
