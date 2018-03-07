// @flow

import path from 'path'

import type { Dependencies, PartialOptions } from './types'

import files from './commands/files'
import commands from './commands/commands'
import ls from './commands/ls'
import emoji from './commands/emoji'
import copyFiles from './commands/copyFiles'
import moveFiles from './commands/moveFiles'
import removeFiles from './commands/removeFiles'
import relativePathInsert from './commands/relativePathInsert'
import relativePathCopy from './commands/relativePathCopy'
import gitFiles from './commands/gitFiles'
import gitBranches from './commands/gitBranches'
import gitLog from './commands/gitLog'
import gitLogCheckout from './commands/gitLogCheckout'
import gitStage from './commands/gitStage'
import gitCheckout from './commands/gitCheckout'
import gitReflog from './commands/gitReflog'
import gitReflogCheckout from './commands/gitReflogCheckout'
import lines from './commands/lines'
import find from './commands/find'
import replace from './commands/replace'
import allLines from './commands/allLines'
import autocompleteLines from './commands/autocompleteLines'

import render from './render'

import { getOptions } from './selectors'

import dependenciesFactory from './dependencies'

import {
	next,
	previous,
	left,
	right,
	hide,
	accept,
	findToggle,
	copyFilesConfirm,
	moveFilesConfirm,
	togglePattern
} from './thunks'

export default ({ subscriptions, fileIconsService }: any) => {
	const dependencies: Dependencies = dependenciesFactory({ fileIconsService })

	const { store, fromAction, commandFactory } = dependencies

	fromAction('HIDE').subscribe(() => {
		const editor = atom.workspace.getActiveTextEditor()
		const view = editor && atom.views.getView(editor)
		view && view.focus()
	})

	const reactRoot = document.createElement('div')

	render(reactRoot, dependencies)

	atom.workspace.addBottomPanel({ item: reactRoot, model: {} })

	const onDone = extraInput => {
		store.dispatch({ type: 'HIDE' })
		atom.workspace.open(extraInput.value)
	}

	const add = (name, commandFactoryOptions: Dependencies => PartialOptions) => {
		const command = commandFactory(commandFactoryOptions)
		subscriptions.add(
			atom.commands.add('atom-workspace', {
				[`sparkling:${name}`]: command
			})
		)
	}

	add('files', files)
	add('emoji', emoji)
	add('relativePathInsert', relativePathInsert)
	add('relativePathCopy', relativePathCopy)
	add('gitFiles', gitFiles)
	add('gitStage', gitStage)
	add('gitBranches', gitBranches)
	add('gitLog', gitLog)
	add('gitLogCheckout', gitLogCheckout)
	add('gitCheckout', gitCheckout)
	add('gitReflog', gitReflog)
	add('gitReflogCheckout', gitReflogCheckout)
	add('lines', lines)
	add('allLines', allLines)
	add('autocompleteLines', autocompleteLines)
	add('find', find)
	add('replace', replace)
	add('removeFiles', removeFiles)
	add('moveFiles', moveFiles)
	add('copyFiles', copyFiles)

	const lsCommand = commandFactory(ls)
	const commandsCommand = commandFactory(commands)

	subscriptions.add(
		atom.commands.add('atom-workspace', {
			'sparkling:toggleSelfFind': () => {
				const editor = atom.workspace.getActiveTextEditor()
				const cwd = atom.project.getPaths()[0]
				const self = editor ? editor.getPath() : atom.project.getPaths()[0]

				let pattern = cwd === self ? cwd : self.replace(cwd, '')

				if (pattern[0] === '/') {
					pattern = pattern.slice(1)
				}

				store.dispatch(togglePattern({ pattern }))
			},
			'sparkling:next': () => store.dispatch(next()),
			'sparkling:previous': () => store.dispatch(previous()),
			'sparkling:left': () => store.dispatch(left()),
			'sparkling:right': () => store.dispatch(right()),
			'sparkling:accept': () => store.dispatch(accept()),
			'sparkling:hide': () => store.dispatch(hide()),
			'sparkling:commands': () => {
				commandsCommand({ activeElement: document.activeElement })
			},
			'sparkling:ls': () => {
				const activeTextEditor = atom.workspace.getActiveTextEditor()
				const finalPath = activeTextEditor
					? path.dirname(activeTextEditor.getPath())
					: atom.project.getPaths()[0]

				lsCommand({ path: finalPath, description: finalPath, lsCommand })
			},
			'sparkling:lsUp': () => {
				const { path: optionsPath } = getOptions(store.getState())
				const finalPath = path.resolve(optionsPath || '.', '..')

				lsCommand({ path: finalPath, description: finalPath, lsCommand })
			},
			'sparkling:moveFilesConfirm': () =>
				store.dispatch(moveFilesConfirm(onDone)),
			'sparkling:copyFilesConfirm': () =>
				store.dispatch(copyFilesConfirm(onDone)),
			'sparkling:findToggle': () => {
				const editor = atom.workspace.getActiveTextEditor()
				const find = editor ? editor.getSelectedText() : ''
				const scope = ''

				store.dispatch(findToggle({ find, scope }))
			},
			'sparkling:findInBufferToggle': () => {
				const editor = atom.workspace.getActiveTextEditor()
				const find = editor ? editor.getSelectedText() : ''
				const cwd = atom.project.getPaths()[0]
				const scope = editor ? editor.getPath().replace(cwd, '') : ''

				store.dispatch(findToggle({ find, scope }))
			}
		})
	)

	return commandFactory
}