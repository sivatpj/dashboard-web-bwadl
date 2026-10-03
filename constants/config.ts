/**
 * FEATURE_FLAGS — control visibility of action buttons in the 3-dot menu.
 * 0 = hidden, 1 = visible.
 * Toggle here to instantly show/hide buttons without touching component code.
 */
export const FEATURE_FLAGS: Record<string, number> = {
	SHOW_CANCEL_BUTTON_SALES_ORDER: 0,
	SHOW_DELETE_BUTTON_SALES_ORDER: 1,
	SHOW_CANCEL_BUTTON_INVOICE: 0,
	SHOW_DELETE_BUTTON_INVOICE: 1,
	SHOW_MARK_AS_FINAL_BUTTON_INVOICE: 1,
};

export const TOASTER_MESSAGE_DURATION_SECONDS = 4;

export const config = {
	LOADER_MINIMUM_DISPLAY_TIME_MS: 500,
	LOCAL_STORAGE_KEYS: {
		LANGUAGE: "language",
		PAGE_SIZE: "admin_page_size",
		TOKEN: "token",
	},
	LOGGED_IN_REDIRECT: "/dashboard/buyers",
	PAGE_SIZE_OPTIONS: [6, 10, 25, 50, 100],
	PAYMENT_TRANSACTION_PAGE_SIZE_OPTIONS: [50, 100, 150, 200],
	SALESORDERINBUYERTAB: 6,
	COLLECTOR_INVOICE_LIST_PAGE_SIZE: 10,
	COLLECTOR_BUYER_LIST_PAGE_SIZE: 10,
	SUPPLIER_INVOICE_LIST_PAGE_SIZE: 10,
	PATHS: {
		auth: {
			addCr: "/sign-up/add-cr",
			forgotPassword: "/forgot-password",
			signIn: "/sign-in",
			signUp: "/sign-up",
		},
		dashboard: {
			ADMIN: {
				adminCenter: {
					users: "/dashboard/admin-center/users",
				},
				banks: "/dashboard/banks",
				buyer: (id: number) => `/dashboard/buyers/${id}`,
				editBuyer: (id: number) => `/dashboard/buyers/${id}/edit`,
				buyers: "/dashboard/buyers",
				collector: (id: number) => `/dashboard/collectors/${id}`,
				collectors: "/dashboard/collectors",
				dataUpload: "/dashboard/data-upload",
				fileUploadList: "/dashboard/file-upload/upload-list",
				fileUploadListDetail: (batchId: string) => `/dashboard/file-upload/upload-list/${batchId}`,
				fileUploadListJournalEntry: (batchId: string, journalEntryId: number) =>
					`/dashboard/file-upload/upload-list/${batchId}/journal-entry/${journalEntryId}`,
				fileUploadIgnoreList: "/dashboard/file-upload/ignore-list",
				fileUploadEscalationReport: "/dashboard/file-upload/escalation-report",
				financier: (id: number) => `/dashboard/financiers/${id}`,
					editFinancier: (id: number) => `/dashboard/financiers/${id}/edit`,
				financierOffer: (financierId: number, offerId: number) =>
					`/dashboard/financiers/${financierId}/offer/${offerId}`,
				financiers: "/dashboard/financiers",
				home: "/dashboard",
				insurer: (id: number) => `/dashboard/insurers/${id}`,
				insurers: "/dashboard/insurers",
				invoice: (id: number, buyerId: number) => `/dashboard/buyers/${buyerId}/invoice/${id}`,
				invoices: "/dashboard/invoices",
				overdueSalesOrdersReport: "/dashboard/reports/overdue-sales-orders",
				salesOrder: (id: number, buyerId: number) => `/dashboard/buyers/${buyerId}/sales-order/${id}`,
				salesOrders: "/dashboard/sales-orders",
				settings: "/dashboard/settings",
				statement: (id: number) => `/dashboard/statements/${id}`,
				statements: "/dashboard/statements",
				supplier: (id: number) => `/dashboard/suppliers/${id}`,
				editSupplier: (id: number) => `/dashboard/suppliers/${id}/edit`,
				suppliers: "/dashboard/suppliers",
				accountingEvents: "/dashboard/transactions/accounting-events",
				transaction: (id: number) => `/dashboard/transactions/${id}`,
				transactions: "/dashboard/transactions",
				accounts: "/dashboard/accounts",
				transfer: (id: number) => `/dashboard/transfers/${id}`,
				transfers: "/dashboard/transfers",
			},
			BUYER: {
				home: "/dashboard",
				merchants: "/dashboard/merchants",
				myOrders: "/dashboard/my-orders",
				settings: "/dashboard/settings",
			},
		},
		home: "/",
		termsAndConditions: "/terms-and-conditions",
	},
	RESEND_OTP_INTERVAL: process.env.NODE_ENV === "development" ? 3 : 60,
	TRANSLATION: {
		DEFAULT_LANGUAGE: process.env.NODE_ENV === "development" ? "en" : "ar",
		RTL: ["ar"],
	},
};
