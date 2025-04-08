const ALL_GIVING_STATS = `https://givingday.utdallas.edu/public_ajax/givingdays/83844/stats`
const ORG_GIVING_STATS = `https://givingday.utdallas.edu/public_ajax/givingdays/83967/stats`
const DISC_WEBHOOK = process.env.DISC_WEBHOOK

if (!DISC_WEBHOOK) throw new Error("Missing Discord webhook URL.")


const MSG_WHEN_AT_X_NUM_DONATIONS = [1958, 1965, 1968, 2014, 2019, 2023]
const TARGETS = [2024, 1969]

type Stats = {total_donations: number, num_donations: number}

const getUTDStats = async () => {
  return getStats(ALL_GIVING_STATS)
}
const getOrgStats = async () => {
  return getStats(ORG_GIVING_STATS)
}
const getStats = async (url: string) => {
  const response = await fetch(url)
  return response.json() as Promise<Stats>
}

const sendDiscordMessage = async (message: string) => {
    await fetch(DISC_WEBHOOK, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({content: message})
    })
}

const messagesToSend: string[] = []

const main = async () => {
    console.log('Getting UTD Stats...')
    const {num_donations: global_num_donations, total_donations: global_total_donations} = await getUTDStats()
    console.log('Getting Org Stats...')
    const {num_donations: org_num_donations, total_donations: org_total_donations} = await getOrgStats()
    const closestTarget = TARGETS.reduce((prev, curr) => Math.abs(curr - global_num_donations) < Math.abs(prev - global_num_donations) ? curr : prev)
    console.log(`Total donations: ${global_total_donations}`)
    console.log(`Number of donations: ${global_num_donations}`)
    console.log(`Closest target: ${closestTarget}`)
    if (MSG_WHEN_AT_X_NUM_DONATIONS.includes(global_num_donations)) {
        messagesToSend.push(`UTD has reached ${global_num_donations} donations which is ${closestTarget - global_num_donations} away from ${closestTarget}! @here`)
    } 
    // else {
    //     messagesToSend.push(`UTD is at ${global_num_donations} donations.`)
    // }
    // messagesToSend.push(`We have raised $${org_total_donations} from ${org_num_donations} donations!`)
    console.log({messagesToSend})

    if (messagesToSend.length > 0) {
        await sendDiscordMessage(messagesToSend.join('\n\n'))
    } else {
        console.log('No messages to send.')
    }
}

await main()
