# Create the main src directory
mkdir -p src/{assets/{images,icons,fonts},components/{auth,dashboard,jobPost,investment,user,payment,notifications,support,transaction},hooks,services,pages,context,utils,styles/components}

# Create files inside assets
touch src/assets/{images/.gitkeep,icons/.gitkeep,fonts/.gitkeep}

# Create files inside components/auth
touch src/components/auth/{LoginPage.tsx,SignUpPage.tsx}

# Create files inside components/dashboard
touch src/components/dashboard/{Dashboard.tsx,JobPostList.tsx,JobCard.tsx}

# Create files inside components/jobPost
touch src/components/jobPost/{PostJobPage.tsx,JobDetails.tsx}

# Create files inside components/investment
touch src/components/investment/{InvestmentPage.tsx,AgreementForm.tsx}

# Create files inside components/user
touch src/components/user/{ProfilePage.tsx,SettingsPage.tsx}

# Create files inside components/payment
touch src/components/payment/{PaymentPage.tsx,CommissionDetails.tsx}

# Create files inside components/notifications
touch src/components/notifications/{NotificationList.tsx,AlertModal.tsx}

# Create files inside components/support
touch src/components/support/{SupportPage.tsx,FeedbackForm.tsx}

# Create files inside components/transaction
touch src/components/transaction/TransactionHistory.tsx

# Create files inside hooks
touch src/hooks/{useAuth.tsx,usePayment.tsx,useNotification.tsx}

# Create files inside services
touch src/services/{authService.ts,jobService.ts,paymentService.ts,notificationService.ts,userService.ts}

# Create files inside pages
touch src/pages/{HomePage.tsx,TermsPage.tsx,PrivacyPage.tsx,NotFoundPage.tsx}

# Create files inside context
touch src/context/{AuthContext.tsx,PaymentContext.tsx,NotificationContext.tsx}

# Create files inside utils
touch src/utils/{formatCurrency.ts,validateForm.ts,dateUtils.ts}

# Create files inside styles
touch src/styles/{globalStyles.css,theme.css}

# Create component-specific styles
touch src/styles/components/{Button.module.css,Form.module.css,Header.module.css}

# Create root files
touch src/{App.tsx,index.tsx,.env}
