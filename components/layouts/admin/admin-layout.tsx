import BreadcrumbsProvider from "@/contexts/breadcrumbs";
import { AdminHeader } from "./admin-header";
import { AdminSidebar } from "./admin-sidebar";

export const AdminLayout = (props: { children: React.ReactNode }) => {
	const { children } = props;

	return (
		<BreadcrumbsProvider>
			<div className="fixed flex-col gap-4 bg-gradient-to-r from-[#E8E9EA] to-[#E0F4FF] top-0 bottom-0 right-0 left-0" />

			<div className="flex h-full min-h-screen flex-col gap-4">
				<div className="relative flex min-h-screen gap-4">
					<AdminSidebar />

					<div className="flex min-h-full flex-1 flex-col gap-4 ltr:ml-[60px] rtl:mr-[60px]">
						<AdminHeader />

						{children}
					</div>
				</div>
			</div>
		</BreadcrumbsProvider>
	);
};
