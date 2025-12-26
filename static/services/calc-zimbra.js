/* Global */

const sectionCalc = 'section#calculator '
let plotData = []

/* Selectors */

const elem_type = document.querySelector(sectionCalc + 'select[name=type]')
const elem_location = document.querySelector(sectionCalc + 'select[name=location]')

const elem_serverWrapper = document.querySelector(sectionCalc + '.server-wrapper')
const elem_serverPlan = document.querySelector(sectionCalc + 'select[name=server-plan]')

const elem_accountWrapper = document.querySelector(sectionCalc + '.account-wrapper')
const elem_accountAmount = document.querySelector(sectionCalc + 'input[name=account-amount]')
const elem_accountStorage = document.querySelector(sectionCalc + 'input[name=account-storage]')

const elem_monthlyEstimate = document.querySelector(sectionCalc + '.monthly-estimate span:last-child')


/* Function */

const populate = () => {
    const type = elem_type.value
    const location = elem_location.value

    elem_serverWrapper.hidden = type === 'account'
    elem_accountWrapper.hidden = type === 'server'

    if (type === 'account') {
        elem_accountStorage.value = location === 'india' ? '5GB' : '30GB'
    } else {
        const subPlans = jinja_plans[1]['sub_plans'][location].map(x => {return {'name': `${x[0]}GB`}})
        elem_serverPlan.innerHTML = arrayToOptions(subPlans, lower=false)
    }

    calculate()
}

const calculate = () => {
    const type = elem_type.value
    const location = elem_location.value

    if (type === 'account') { 
        const accountAmount = elem_accountAmount.value

        plotData = [accountAmount + 'x Managed Account', jinja_plans[0]['price'] * accountAmount]
    } else { 
        const subPlans = {}
        jinja_plans[1]['sub_plans'][location].map(subPlan => {
            subPlans[subPlan[0] + 'GB'] = subPlan[1]
        })

        plotData = ['1x Managed Server', subPlans[elem_serverPlan.value]]
    }

    tablePopulate()
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

    elem_outputTable(1, 1).innerHTML = plotData[0]
    elem_outputTable(1, 2).innerHTML = '₹ ' + plotData[1].toFixed(1)

    const GST = (plotData[1] / 100) * 18
    const total = plotData[1] + GST

    elem_outputTable(2, 1).innerHTML = '18% GST'
    elem_outputTable(2, 2).innerHTML = '₹ ' + GST.toFixed(1)
    elem_outputTable(3, 1).innerHTML = 'Total'
    elem_outputTable(3, 2).innerHTML = '₹ ' + total.toFixed(1)

    elem_monthlyEstimate.innerHTML = '₹ ' + (total/12).toFixed(1)
}


/* Calculate Listeners */

elem_type.addEventListener('change', populate)
elem_location.addEventListener('change', populate)

elem_serverPlan.addEventListener('change', calculate)
elem_accountAmount.addEventListener('input', calculate)

/* Init */

tableCreate(3, 2)
populate()
