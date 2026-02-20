# Student Finance Tracker

A modern, responsive web application designed for students to manage their budgets and track expenses effectively.

## 🚀 Features

- **Dynamic Dashboard**: Real-time visualization of balance, monthly spending, and transaction trends.
- **Transaction Management**: Easily add, edit, and delete income and expense records with automated timestamps.
- **Budgeting**: Set monthly budget limits and visualize your spending progress with automated forecasts and **ARIA live announcements**.
- **Advanced Filtering**: Search and sort transactions by description, amount, or date.
- **Settings & Customization**:
  - **Dark Mode**: Switch between light and dark themes for a personalized experience.
  - **Multi-Currency Support**: View your finances in USD, EUR, GBP, KES, INR, JPY, or RWF.
  - **Data Portability**: Export your data to JSON or import from a backup file.
- **Accessibility**: Built with semantic HTML, keyboard-only flow, and skip-to-content links.

## 🎨 Design Planning (M1)

Initial hand-drawn planning for the Student Finance Tracker across all devices:
Desktop Design
![Desktop Design](https://github.com/iaxcel-ai/finance-tracker/blob/a48510fc8c67f7b65c36084df6288fa63139a25e/assets/design/desktop%20design.png)

Tablet Design
![Tablet Design](https://github.com/iaxcel-ai/finance-tracker/blob/ed6ab258037e133c18335021a7445cd166ce3d63/assets/design/tab%20design.png)

Mobile Design
![Mobile Design](https://github.com/iaxcel-ai/finance-tracker/blob/ed6ab258037e133c18335021a7445cd166ce3d63/assets/design/mobile%20design.png)


## 🛠️ Technology Stack

- **HTML5**: Semantic structure (header, nav, main, section, footer).
- **Vanilla CSS**: Custom design system with CSS variables, Flexbox, Grid, and mobile-first media queries.
- **Modular JavaScript (ES6+)**: Modular code separation:
  - `storage.js`: Persistence and Import/Export logic.
  - `ui.js`: DOM manipulation and Chart implementation.
  - `validators.js`: Regex validation and search logic.
  - `utils.js`: Formatting and ID generation.
- **Chart.js**: Interactive data visualization.

## 🧪 Regex Catalog

| Rule         | Pattern                        | Match Example             | Fail Example                 |
| :----------- | :----------------------------- | :------------------------ | :--------------------------- | ---------------------------- |
| Description  | `/^[A-Za-z]+(?: [A-Za-z]+)*$/` | `Bus Ticket`              | `Bus  Ticket` (double space) |
| Amount       | `/^(0                          | [1-9]\d\*)(\.\d{1,2})?$/` | `12.50`                      | `12.555` (too many decimals) |
| Date         | `/^\d{4}-\d{2}-\d{2}/`         | `2026-02-20`              | `20-02-2026`                 |
| **Advanced** | `/\b(\w+)\s+\1\b/`             | `Coffee Coffee`           | `Coffee Tea`                 |

## ⌨️ Keyboard Map

| Key               | Action                                                |
| :---------------- | :---------------------------------------------------- |
| `Tab`             | Navigate through interactive elements.                |
| `Enter` / `Space` | Activate buttons and links.                           |
| `Esc`             | Close mobile menu or cancel budget editing.           |
| `Alt + S`         | (Browser standard) Focus "Skip to main content" link. |

## ♿ Accessibility Notes

- **Aria Live**: Uses `role="status"` and `aria-live="polite"` for general notifications.
- **Assertive Alerts**: Budget overage triggers an `aria-live="assertive"` alert for immediate screen reader feedback.
- **Semantic landmarks**: Full use of `<main>`, `<aside>`, `<nav>`, and `<header>` for navigation ease.
- **Contrast**: All colors meet WCAG AA standards for readability.

## 📦 Getting Started

### Installation

1. Clone the repository.
2. Open `index.html` in your web browser.

### Running Tests

Open `tests.html` in your browser to view the unit test suite and implementation assertions.

## 👨‍💻 Developer Information

- **Name**: Ishimwe Axcel
- **Email**: i.axcel@alustudent.com
- **GitHub**: [iaxcel-ai](https://github.com/iaxcel-ai)
- **GitHub Pages**: [https://iaxcel-ai.github.io/finance-tracker/](https://iaxcel-ai.github.io/finance-tracker/)
- **youtube video link**: https://youtu.be/084yOKflt6M

---

© 2026 Student Finance Tracker
