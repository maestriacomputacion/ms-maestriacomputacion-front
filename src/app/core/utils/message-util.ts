import { PrimeIcons } from "primeng/api"

export function infoMessage(msg: string) {
    return {
        severity: 'info',
        detail: msg
    }
}

export function errorMessage(msg: string) {
    return {
        severity: 'error',
        detail: msg
    }
}

export function warnMessage(msg: string) {
    return {
        severity: 'warn',
        detail: msg
    }
}

export function confirmMessage(msg: string) {
    return {
        message: msg,
        header: 'Confirmación',
        defaultFocus: 'none',
        acceptLabel: 'Si',
        rejectLabel: 'No',
        icon: PrimeIcons.EXCLAMATION_CIRCLE,
        rejectButtonStyleClass: 'p-button-outlined'
    }
}

