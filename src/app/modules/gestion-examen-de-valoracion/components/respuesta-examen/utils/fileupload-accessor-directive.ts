import { Directive, HostListener, Input, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';

@Directive({
    selector: '[appFileUpload]',
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => FileUploadValueAccessorDirective),
            multi: true,
        },
    ],
})
export class FileUploadValueAccessorDirective implements ControlValueAccessor {
    @Input('appFileUpload') fileUpload: any;

    private onChange: (_: any) => void = () => {};
    private onTouched: () => void = () => {};

    writeValue(value: any): void {
        // No necesitamos hacer nada aquí
    }

    registerOnChange(fn: any): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }

    @HostListener('onSelect', ['$event'])
    onSelect(event: any): void {
        this.onChange(this.fileUpload.files);
        this.onTouched();
    }
}
