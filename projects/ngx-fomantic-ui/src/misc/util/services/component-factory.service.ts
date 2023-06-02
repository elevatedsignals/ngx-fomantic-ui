import {
  ApplicationRef,
  ComponentFactoryResolver,
  ComponentRef,
  Injectable,
  Injector,
  Provider,
  StaticProvider,
  TemplateRef,
  Type,
  ViewContainerRef
} from '@angular/core';

export interface IImplicitContext<T> {
  $implicit?: T;
}

@Injectable()
export class FuiComponentFactory {
  constructor(private _applicationRef: ApplicationRef,
              private _componentFactoryResolver: ComponentFactoryResolver,
              private _injector: Injector) {
  }

  public createComponent<T>(type: Type<T>, providers: Provider[] = []): ComponentRef<T> {
    // Resolve a factory for creating components of type `type`.
    const factory = this._componentFactoryResolver.resolveComponentFactory(type as Type<T>);

    const staticProviders: StaticProvider[] = providers.map(provider => {
      if ((provider as any).provide) { // ClassProvider, ValueProvider, FactoryProvider, etc.
        return {
          provide: (provider as any).provide,
          useFactory: (provider as any).useFactory,
          deps: (provider as any).deps || [],
          useValue: (provider as any).useValue,
          useClass: (provider as any).useClass,
          useExisting: (provider as any).useExisting,
          multi: (provider as any).multi,
        };
      } else { // Type<any>
        return {provide: provider, useClass: provider as Type<any>, deps: []};
      }
    });

    // Resolve and create an injector with the specified providers.
    const injector = Injector.create({providers: staticProviders, parent: this._injector});

    // Create a component using the previously resolved factory & injector.
    const componentRef = factory.create(injector);

    return componentRef;
  }

  public createView<T, U extends IImplicitContext<T>>(viewContainer: ViewContainerRef, template: TemplateRef<U>, context: U): void {
    viewContainer.createEmbeddedView<U>(template, context);
  }

  // Inserts the component into the specified view container.
  public attachToView<T>(componentRef: ComponentRef<T>, viewContainer: ViewContainerRef): void {
    viewContainer.insert(componentRef.hostView, 0);
  }

  // Inserts the component in the root application node.
  public attachToApplication<T>(componentRef: ComponentRef<T>): void {
    this._applicationRef.attachView(componentRef.hostView);
  }

  // Detaches the component from the root application node.
  public detachFromApplication<T>(componentRef: ComponentRef<T>): void {
    this._applicationRef.detachView(componentRef.hostView);
  }

  // Moves the component to the specified DOM element.
  public moveToElement<T>(componentRef: ComponentRef<T>, element: Element): void {
    element.appendChild(componentRef.location.nativeElement);
  }

  // Moves the component to the document body.
  public moveToDocumentBody<T>(componentRef: ComponentRef<T>): void {
    this.moveToElement(componentRef, document.querySelector('body')!);
  }

  public detachFromDocument<T>(componentRef: ComponentRef<T>): void {
    const element = componentRef.location.nativeElement as Element;
    // We can't use `element.remove()` due to lack of IE11 support.
    if (element.parentNode) {
      element.parentNode.removeChild(element);
    }
  }
}
