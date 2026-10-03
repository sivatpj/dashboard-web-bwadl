"use client";

export default function Layout(props: LayoutProps<"/">) {
	const { children } = props;

	return <div className="h-screen bg-gradient-to-bl from-[#E0F4FF] to-[#E8E9EA]">{children}</div>;
}
