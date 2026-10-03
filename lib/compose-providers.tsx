export const composeProviders = ((providers: any[]) =>
	({ children }: { children: React.ReactNode }) =>
		[...providers].reduceRight((acc, [Provider, props]) => <Provider {...props}>{acc}</Provider>, children)) as any;
