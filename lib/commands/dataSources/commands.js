

                                                            

import { getOptions } from '../../selectors'

export default ({ store }              ) => (
	onData                              
)               => {
	const options = getOptions(store.getState())

	if (options.id !== 'sparkling-commands') {
		return () => {}
	}

	const { activeElement } = options

	const commands = atom.commands.findCommands({
		target: activeElement
	})

	const keybindings = atom.keymaps.findKeyBindings({
		target: activeElement
	})

	const keybindingsMap = keybindings.reduce((acc, keybinding) => {
		acc[keybinding.command] = keybinding
		return acc
	}, {})

	onData(
		commands
			.sort(function(a, b) {
				if (a.name < b.name) {
					return -1
				} else if (a.name > b.name) {
					return 1
				}

				return 0
			})
			.map(({ displayName, name }) => {
				const keybinding = keybindingsMap[name]

				return {
					value: displayName,
					name,
					keybinding,
					activeElement
				}
			})
	)
	return () => {}
}
