import { spawnInProject } from '../../utils'

export default onData => {
	const cmdProcess = spawnInProject('git', ['reflog'])
	cmdProcess.stdout.on('data', data => {
		onData(
			data
				.toString('utf-8')
				.split('\n')
				.filter(s => s.length > 1)
				.map(value => ({ value }))
		)
	})
}