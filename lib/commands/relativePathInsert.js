

import path from 'path'

import loadData from './dataSources/allFiles'
import rendererFactory from './renderers/file'















export default (dependencies              ) => {
	const renderer = rendererFactory(dependencies)

	const { store } = dependencies

	const accept = ({ value }            ) => {
		const editor = atom.workspace.getActiveTextEditor()
		const projectPath = atom.project.getPaths()[0]
		const originPath = editor.getPath()
		const dir = path.dirname(originPath)
		const targetPath = path.resolve(projectPath, value)
		let relativePath = path.relative(dir, targetPath)

		if (relativePath.slice(-3) === '.js') {
			relativePath = relativePath.slice(0, -3)
		}

		if (relativePath.slice(-6) === '/index') {
			relativePath = relativePath.slice(0, -6)
		}

		if (relativePath[0] !== '.') {
			relativePath = './' + relativePath
		}

		store.dispatch({ type: 'HIDE' })
		editor.insertText(relativePath)
	}

	return {
		loadData,
		accept,
		renderer,
		columns: 3,
		description: 'Insert path relative to',
		id: 'sparkling-copy-relative-path'
	}
}
