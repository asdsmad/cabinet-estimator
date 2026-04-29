# UBW Inquiry Site - EmailJS Version

## Run locally
```bash
npm install
npm run dev
```

## Before sending emails
Open `src/App.jsx` and replace these 3 values:

- `YOUR_SERVICE_ID`
- `YOUR_TEMPLATE_ID`
- `YOUR_PUBLIC_KEY`

## Install EmailJS
This project already includes `@emailjs/browser` in package.json.

## Recommended EmailJS template variables
Create an EmailJS template using these variables:

- `{{customer_name}}`
- `{{company_name}}`
- `{{customer_phone}}`
- `{{customer_email}}`
- `{{project_address}}`
- `{{city_state}}`
- `{{project_type}}`
- `{{timeline}}`
- `{{material_family}}`
- `{{style_series}}`
- `{{door_style}}`
- `{{finish_color}}`
- `{{submitted_at}}`

## Suggested email subject
New inquiry from {{customer_name}}

## Notes
- EmailJS browser SDK supports `send` and `sendForm`, and React examples use `@emailjs/browser`. The Public Key is required, and EmailJS also documents browser-side rate-limiting and blocking options. See the official docs for current details.
