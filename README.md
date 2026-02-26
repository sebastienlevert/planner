# Family Planner

A comprehensive React-based family planning application with multi-calendar sync, photo slideshow, AI-powered meal planning, and task management.

> **📘 For Developers & AI Agents:** See [AGENTS.md](./AGENTS.md) for comprehensive technical documentation, architecture decisions, development patterns, and troubleshooting guides.

## Features

- **Multi-Account Calendar Sync**: View and manage calendars from multiple Outlook.com accounts
- **Calendar Views**: Switch between weekly, daily, and monthly views
- **Event Creation**: Create new events and select the target calendar
- **OneDrive Photo Slideshow**: Display photos from your OneDrive folder in a slideshow
- **AI Meal Planning**: Get recipe suggestions based on fridge inventory using Azure OpenAI
- **Microsoft To Do Integration**: Manage tasks and to-do lists
- **Tablet Optimized**: Designed for Surface tablets with wake lock support
- **Offline Support**: Works with cached data when offline

## Tech Stack

- React 18 + TypeScript
- Vite (Build tool)
- Tailwind CSS (Styling)
- React Router v6 (Routing)
- Microsoft Graph API (Calendar, OneDrive, To Do)
- Azure OpenAI (Recipe generation)
- MSAL Browser (Authentication)

## Prerequisites

### 1. Azure AD App Registration

You need to create an Azure AD application to enable OAuth authentication:

1. Go to [Azure Portal - App Registrations](https://portal.azure.com/#view/Microsoft_AAD_IAM/ActiveDirectoryMenuBlade/~/RegisteredApps)
2. Click "New registration"
3. Configure:
   - **Name**: Family Planner (or your preferred name)
   - **Supported account types**: Accounts in any organizational directory and personal Microsoft accounts
   - **Redirect URI**:
     - Platform: Single-page application (SPA)
     - URI: `http://localhost:5173/auth/callback`
4. After registration, note the **Application (client) ID**
5. Go to "API permissions" and add the following Microsoft Graph permissions:
   - `User.Read` - Read user profile
   - `Calendars.ReadWrite` - Read and write calendars
   - `Calendars.ReadWrite.Shared` - Access shared calendars
   - `Files.Read` - Read OneDrive files
   - `Tasks.ReadWrite` - Read and write tasks (for Microsoft To Do)
   - `offline_access` - Maintain access to data
6. Click "Grant admin consent" (if applicable)

### 2. Azure OpenAI Resource

You need an Azure OpenAI resource for meal planning features:

1. Create an Azure OpenAI resource in Azure Portal
2. Deploy a model (GPT-4 or GPT-3.5-turbo recommended)
3. Note the:
   - **Endpoint URL** (e.g., `https://your-resource.openai.azure.com`)
   - **API Key**
   - **Deployment name**

## Installation

1. **Clone or navigate to the project directory**:
   ```bash
   cd /home/slevert/src/sebastienlevert/planner
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Create environment file**:
   Copy `.env.example` to `.env` and fill in your values:
   ```bash
   cp .env.example .env
   ```

4. **Edit `.env` with your credentials**:
   ```env
   VITE_MICROSOFT_CLIENT_ID=your_azure_ad_client_id
   VITE_MICROSOFT_REDIRECT_URI=http://localhost:5173/auth/callback
   VITE_AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com
   VITE_AZURE_OPENAI_KEY=your_api_key
   VITE_AZURE_OPENAI_DEPLOYMENT=your_deployment_name
   ```

## Running the Application

1. **Start development server**:
   ```bash
   npm run dev
   ```

2. **Open your browser**:
   Navigate to `http://localhost:5173`

3. **Sign in**:
   - Click "Add Account" to sign in with your Microsoft account
   - You can add multiple accounts (e.g., yours and your spouse's)

## Project Structure

```
planner/
├── src/
│   ├── components/           # React components
│   │   ├── auth/            # Authentication components
│   │   ├── calendar/        # Calendar views and event components
│   │   ├── photos/          # Photo slideshow components
│   │   ├── meals/           # Meal planning components
│   │   └── layout/          # Layout components (Header, Sidebar)
│   ├── contexts/            # React context providers
│   ├── services/            # API services
│   ├── types/               # TypeScript type definitions
│   ├── hooks/               # Custom React hooks
│   ├── utils/               # Utility functions
│   ├── config/              # App configuration
│   ├── pages/               # Page components
│   ├── App.tsx              # Root component
│   ├── main.tsx             # Entry point
│   └── index.css            # Global styles
├── .env.example             # Environment variables template
├── tailwind.config.js       # Tailwind CSS configuration
└── package.json             # Dependencies
```

## Development Status

### ✅ Phase 1: Project Setup & Authentication (COMPLETED)
- ✅ Vite + React + TypeScript project initialized
- ✅ Tailwind CSS configured with custom theme
- ✅ Microsoft OAuth authentication implemented
- ✅ Multi-account support
- ✅ FAB menu navigation
- ✅ Basic layout and routing

### ✅ Phase 2: Calendar Integration (COMPLETED)
- ✅ Fetch calendars from all authenticated accounts
- ✅ Display events in weekly/daily/monthly views
- ✅ Create, edit, and delete events
- ✅ Color-coded events by calendar
- ✅ Auto-sync every 5 minutes
- ✅ Touch-optimized calendar grids

### ✅ Phase 3: OneDrive Photo Slideshow (COMPLETED)
- ✅ Browse OneDrive folder tree
- ✅ Select photo folder with UI picker
- ✅ Automatic slideshow with crossfade transitions
- ✅ Touch controls (pause/play, next/previous)
- ✅ Fullscreen mode

### ✅ Phase 4: Meal Planning & AI Recipes (COMPLETED)
- ✅ Fridge inventory management by category
- ✅ Azure OpenAI recipe generation
- ✅ Save and manage favorite recipes
- ✅ Recipe cards with details
- ✅ Ingredient-based suggestions

### ✅ Phase 5: Microsoft To Do Integration (COMPLETED)
- ✅ View To Do lists from all accounts
- ✅ Create and manage tasks
- ✅ Toggle task completion
- ✅ Sync with Microsoft To Do service
- ✅ Task importance levels
- ✅ Due dates

### ✅ Phase 6: Polish & Tablet Optimization (COMPLETED)
- ✅ Screen Wake Lock API implementation
- ✅ Touch-optimized UI (44x44px minimum targets)
- ✅ FAB menu for touch navigation
- ✅ Responsive design for tablets
- ✅ Loading states and error handling
- ✅ LocalStorage caching

## Usage Guide

### Managing Accounts

1. Go to Settings page
2. Click "Add Account" to sign in with Microsoft
3. Repeat to add multiple accounts (family members)
4. View connected accounts and sign out as needed

### Calendar (Coming Soon)

1. Sign in with at least one account
2. Navigate to Calendar page
3. Switch between Week/Day/Month views
4. Click on time slot to create new event
5. Select which calendar to add the event to

### Photos (Coming Soon)

1. Navigate to Photos page
2. Click "Select Folder" in settings
3. Browse your OneDrive and select a folder
4. Photos will display in automatic slideshow

### Meals (Coming Soon)

1. Navigate to Meals page
2. Add items to your fridge inventory
3. Click "Suggest Recipes" to generate AI recipes
4. Save favorites and add to calendar

### Tasks (Coming Soon)

1. Navigate to Tasks page (or view in Calendar sidebar)
2. View your Microsoft To Do lists
3. Create new tasks or check off completed ones
4. Tasks sync automatically with Microsoft To Do

## Troubleshooting

### Authentication Issues

- **"Authentication initialization failed"**: Check that your client ID is correct in `.env`
- **"Failed to sign in"**: Ensure redirect URI matches in Azure AD app registration
- **"Invalid scopes"**: Verify all required permissions are added and consented

### API Errors

- **401 Unauthorized**: Token expired, try signing out and back in
- **403 Forbidden**: Check API permissions in Azure AD
- **429 Too Many Requests**: Rate limited, wait a moment and try again

### Development Issues

- **Port already in use**: Change port with `npm run dev -- --port 3000`
- **Module not found**: Run `npm install` again
- **Build errors**: Clear cache with `rm -rf node_modules && npm install`

## Features Roadmap

### Phase 2-6 (Upcoming)
- [ ] Complete calendar integration
- [ ] OneDrive photo slideshow
- [ ] AI meal planning
- [ ] Microsoft To Do integration
- [ ] Tablet optimization
- [ ] Wake lock implementation
- [ ] Offline support

### Future Enhancements
- [ ] Push notifications for events
- [ ] Grocery list from recipes
- [ ] Recipe database
- [ ] Calendar sharing
- [ ] Voice commands
- [ ] Smart home integration

## Contributing

This is a personal family planning project. Feel free to fork and adapt for your own use!

## License

MIT License - feel free to use and modify for your personal needs.

## Support

For issues or questions:
1. Check the Troubleshooting section
2. Review Azure AD app configuration
3. Verify environment variables in `.env`
4. Check browser console for error messages
