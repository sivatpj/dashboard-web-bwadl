export default function Layout(props: LayoutProps<"/checkout">) {
	const { children } = props;

	return <div className="h-screen bg-gradient-to-bl from-[#E0F4FF] to-[#E8E9EA]">{children}</div>;
}
