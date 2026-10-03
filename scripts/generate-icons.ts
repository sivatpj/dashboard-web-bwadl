import fs from "fs";
import path from "path";

const iconsDir = path.join(__dirname, "../assets/icons");
const outputFile = path.join(__dirname, "../components/global/icons");

const icons = fs.readdirSync(iconsDir).filter(file => file.endsWith(".svg"));

if (!fs.existsSync(outputFile)) {
	fs.mkdirSync(outputFile, { recursive: true });
} else {
	fs.readdirSync(outputFile).forEach(file => {
		const filePath = path.join(outputFile, file);
		fs.unlink(filePath, err => {
			if (err) {
				console.error(`Error deleting file ${filePath}:`, err);
			} else {
				console.log(`Deleted file: ${filePath}`);
			}
		});
	});
}

const filesAndIcons: Array<{
	name: string;
	fileName: string;
	iconPath: string;
}> = [];

async function generate() {
	await Promise.all(
		icons.map(file => {
			return new Promise<void>((resolve, reject) => {
				const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);
				const name = `${capitalize(file.replace(".svg", "").replace(/-/g, " ")).split(" ").map(capitalize).join("")}Icon`;
				const iconPath = path.join(iconsDir, file);
				const iconContent = fs.readFileSync(iconPath, "utf-8");
				const newFileName = file.replace(".svg", "-icon.tsx");
				const iconFilePath = path.join(outputFile, newFileName);

				let content = iconContent
					.replace("<svg", "<svg {...props}")
					.replaceAll("fill-rule", "fillRule")
					.replaceAll("clip-rule", "clipRule")
					.replaceAll("clip-path", "clipPath")
					.replaceAll("xmlns:xlink", "xmlnsXlink")
					.replace(/xmlns="[^"]*"/, 'xmlns="http://www.w3.org/2000/svg"')
					.replace(/width="[^"]*"/, 'width="inherit"')
					.replace(/height="[^"]*"/, 'height="inherit"');
				if (!name.startsWith("Flag")) {
					content = content.replace(/fill="[^"]*"/g, 'fill="inherit"').replace(/stroke="[^"]*"/g, 'stroke="inherit"');
				}
				const iconFileContent = `export const ${name} = (props: React.SVGProps<SVGSVGElement>) => (${content});`;

				filesAndIcons.push({
					fileName: newFileName,
					iconPath: iconFilePath,
					name: name,
				});

				fs.writeFile(iconFilePath, iconFileContent, err => {
					if (err) {
						reject(err);
					} else {
						console.log(`✅ Generated ${name}`);
						resolve();
					}
				});
			});
		}),
	);

	const iconInterface = `export type IconMapping =\n${filesAndIcons.map(icon => `"${icon.name.replace("Icon", "")}"`).join(" |")};\n`;

	const iconExport = filesAndIcons
		.map(icon => `export { ${icon.name} } from "./${icon.fileName.replace(".tsx", "")}";`)
		.join("\n");

	const indexFile = path.join(outputFile, "index.ts");

	fs.writeFile(indexFile, `${iconInterface}\n${iconExport}`, err => {
		if (err) {
			console.error(`Error writing index file ${indexFile}:`, err);
		} else {
			console.log("🗂️  index.ts written");
		}
	});

	const lintCommand = `npx eslint ${outputFile} --fix`;
	const { exec } = require("child_process");
	exec(lintCommand, (error: any, stdout: string, stderr: string) => {
		if (error) {
			console.error(`Error executing lint command: ${error.message}`);
			return;
		}
		if (stderr) {
			console.error(`Lint stderr: ${stderr}`);
			return;
		}
		console.log(`🔧 ESLint fixes applied`);
	});
}

generate();
