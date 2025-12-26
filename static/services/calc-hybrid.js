/* Global */

const sectionCalc = 'section#calculator '
const plotData = {'pro': ['', 0], 'regular': ['', 0]}

/* Object Proxy to Plot Table */

const toPlot = new Proxy(plotData, {
    set: (target, property, value) => {
        target[property] = value
        tablePopulate()
    }
})

/* Pro Selectors */

const elem_proProvider = document.querySelector(sectionCalc + 'select[name=pro-provider]')
const elem_proPlan = document.querySelector(sectionCalc + 'select[name=pro-plan]')
const elem_proAccountAmount = document.querySelector(sectionCalc + 'input[name=pro-account-amount]')

/* Regular Selectors */

const elem_regularType = document.querySelector(sectionCalc + 'select[name=regular-type]')
const elem_regularLocation = document.querySelector(sectionCalc + 'select[name=regular-location]')

const elem_regularServerWrapper = document.querySelector(sectionCalc + '.regular-server-wrapper')
const elem_regularServerPlan = document.querySelector(sectionCalc + 'select[name=regular-server-plan]')

const elem_regularAccountWrapper = document.querySelector(sectionCalc + '.regular-account-wrapper')
const elem_regularAccountAmount = document.querySelector(sectionCalc + 'input[name=regular-account-amount]')
const elem_regularAccountStorage = document.querySelector(sectionCalc + 'input[name=regular-account-storage]')

/* Other Selectors */

const elem_monthlyEstimate = document.querySelector(sectionCalc + '.monthly-estimate span:last-child')

/* Populate Functions */

const proPopulate = () => {
    elem_proPlan.innerHTML = arrayToOptions(jinja_plans[elem_proProvider.value])
    proCalculate()
}

const regularPopulate = () => {
    const type = elem_regularType.value
    const location = elem_regularLocation.value

    elem_regularServerWrapper.hidden = type === 'account'
    elem_regularAccountWrapper.hidden = type === 'server'

    if (type === 'account') {
        elem_regularAccountStorage.value = location === 'india' ? '5GB' : '30GB'
    } else {
        const subPlans = jinja_plans['zimbra-collaboration'][1]['sub_plans'][location].map(x => {return {'name': `${x[0]}GB`, 'extra': `- Upto ${(x[0]/15).toFixed()} accounts with 15GB`}})
        elem_regularServerPlan.innerHTML = arrayToOptions(subPlans, lower=false)
    }

    regularCalculate()
}

/* Calculate Functions */

const proCalculate = () => {
    const tempPlans = {}
    jinja_plans[elem_proProvider.value].map(tempPlan => {
        tempPlans[tempPlan['name']] = tempPlan['price']
    })

    const valueSlug = document.querySelector(sectionCalc + `option[value=${elem_proPlan.value}]`).innerHTML
    const name = elem_proAccountAmount.value + 'x ' + valueSlug
    const amount = tempPlans[valueSlug] * elem_proAccountAmount.value

    toPlot['pro'] = [name, amount]
}

const regularCalculate = () => {
    const type = elem_regularType.value
    const location = elem_regularLocation.value

    if (type === 'account') { 
        const accountAmount = elem_regularAccountAmount.value

        toPlot['regular'] = [accountAmount + 'x Managed Account', jinja_plans['zimbra-collaboration'][0]['price'] * accountAmount]
    } else { 
        const subPlans = {}
        jinja_plans['zimbra-collaboration'][1]['sub_plans'][location].map(subPlan => {
            subPlans[subPlan[0] + 'GB'] = subPlan[1]
        })

        toPlot['regular'] = ['1x Managed Server', subPlans[elem_regularServerPlan.value]]
    }
}

/* Utlities */

const arrayToOptions = (list, lower=true) => {
    let options_html = ''

    list.forEach(element => {
        let slug = element["name"].replace(" ", "-")

        if (lower) {
            slug = slug.toLowerCase()
        }
        
        options_html += `<option value='${slug}'>${element["name"]}</option>`
    });

    return options_html
}

const elem_outputTable = (row, column) => {
    return document.querySelector(sectionCalc + `tr:nth-child(${row}) td:nth-child(${column})`)
}

const tableCreate = (row, column) => {
    let cell_html = ''

    for (let row_iteration = 0; row_iteration < row; row_iteration++) {
        cell_html += '<tr>'

        for (let column_iteration = 0; column_iteration < column; column_iteration++) {
            cell_html += '<td></td>'
        }

        cell_html += '</tr>'
    }

    document.querySelector(sectionCalc + 'table').innerHTML = cell_html
}

const tablePopulate = () => {
    const proPrice = toPlot['pro'][1]
    elem_outputTable(1, 1).innerHTML = toPlot['pro'][0]
    elem_outputTable(1, 2).innerHTML = '₹ ' + proPrice.toFixed(1)

    const regularPrice = toPlot['regular'][1]
    elem_outputTable(2, 1).innerHTML = toPlot['regular'][0]
    elem_outputTable(2, 2).innerHTML = '₹ ' + regularPrice.toFixed(1)

    const price = proPrice + regularPrice
    const GST = (price / 100) * 18
    const total = price + GST

    elem_outputTable(3, 1).innerHTML = '18% GST'
    elem_outputTable(3, 2).innerHTML = '₹ ' + GST.toFixed(1)
    elem_outputTable(4, 1).innerHTML = 'Total'
    elem_outputTable(4, 2).innerHTML = '₹ ' + total.toFixed(1)

    elem_monthlyEstimate.innerHTML = '₹ ' + (total/12).toFixed(1)
}


/* Populate Listeners */

elem_proProvider.addEventListener('change', proPopulate)

elem_regularType.addEventListener('change', regularPopulate)
elem_regularLocation.addEventListener('change', regularPopulate)

/* Calculate Listeners */

elem_proPlan.addEventListener('change', proCalculate)
elem_proAccountAmount.addEventListener('input', proCalculate)

elem_regularServerPlan.addEventListener('change', regularCalculate)
elem_regularAccountAmount.addEventListener('input', regularCalculate)

/* Init */

tableCreate(4, 2)
proPopulate()
regularPopulate()
