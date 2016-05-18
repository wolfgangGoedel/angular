var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { CompileTemplateMetadata } from './directive_metadata';
import { isPresent } from 'angular2/src/facade/lang';
import { BaseException } from 'angular2/src/facade/exceptions';
import { PromiseWrapper } from 'angular2/src/facade/async';
import { XHR } from 'angular2/src/compiler/xhr';
import { UrlResolver } from 'angular2/src/compiler/url_resolver';
import { extractStyleUrls, isStyleUrlResolvable } from './style_url_resolver';
import { Injectable } from 'angular2/src/core/di';
import { ViewEncapsulation } from 'angular2/src/core/metadata/view';
import { HtmlTextAst, htmlVisitAll } from './html_ast';
import { HtmlParser } from './html_parser';
import { preparseElement, PreparsedElementType } from './template_preparser';
export let TemplateNormalizer = class TemplateNormalizer {
    constructor(_xhr, _urlResolver, _htmlParser) {
        this._xhr = _xhr;
        this._urlResolver = _urlResolver;
        this._htmlParser = _htmlParser;
    }
    normalizeTemplate(directiveType, template) {
        if (isPresent(template.template)) {
            return PromiseWrapper.resolve(this.normalizeLoadedTemplate(directiveType, template, template.template, directiveType.moduleUrl));
        }
        else if (isPresent(template.templateUrl)) {
            var sourceAbsUrl = this._urlResolver.resolve(directiveType.moduleUrl, template.templateUrl);
            return this._xhr.get(sourceAbsUrl)
                .then(templateContent => this.normalizeLoadedTemplate(directiveType, template, templateContent, sourceAbsUrl));
        }
        else {
            throw new BaseException(`No template specified for component ${directiveType.name}`);
        }
    }
    normalizeLoadedTemplate(directiveType, templateMeta, template, templateAbsUrl) {
        var rootNodesAndErrors = this._htmlParser.parse(template, directiveType.name);
        if (rootNodesAndErrors.errors.length > 0) {
            var errorString = rootNodesAndErrors.errors.join('\n');
            throw new BaseException(`Template parse errors:\n${errorString}`);
        }
        var visitor = new TemplatePreparseVisitor();
        htmlVisitAll(visitor, rootNodesAndErrors.rootNodes);
        var allStyles = templateMeta.styles.concat(visitor.styles);
        var allStyleAbsUrls = visitor.styleUrls.filter(isStyleUrlResolvable)
            .map(url => this._urlResolver.resolve(templateAbsUrl, url))
            .concat(templateMeta.styleUrls.filter(isStyleUrlResolvable)
            .map(url => this._urlResolver.resolve(directiveType.moduleUrl, url)));
        var allResolvedStyles = allStyles.map(style => {
            var styleWithImports = extractStyleUrls(this._urlResolver, templateAbsUrl, style);
            styleWithImports.styleUrls.forEach(styleUrl => allStyleAbsUrls.push(styleUrl));
            return styleWithImports.style;
        });
        var encapsulation = templateMeta.encapsulation;
        if (encapsulation === ViewEncapsulation.Emulated && allResolvedStyles.length === 0 &&
            allStyleAbsUrls.length === 0) {
            encapsulation = ViewEncapsulation.None;
        }
        return new CompileTemplateMetadata({
            encapsulation: encapsulation,
            template: template,
            templateUrl: templateAbsUrl,
            styles: allResolvedStyles,
            styleUrls: allStyleAbsUrls,
            ngContentSelectors: visitor.ngContentSelectors
        });
    }
};
TemplateNormalizer = __decorate([
    Injectable(), 
    __metadata('design:paramtypes', [XHR, UrlResolver, HtmlParser])
], TemplateNormalizer);
class TemplatePreparseVisitor {
    constructor() {
        this.ngContentSelectors = [];
        this.styles = [];
        this.styleUrls = [];
        this.ngNonBindableStackCount = 0;
    }
    visitElement(ast, context) {
        var preparsedElement = preparseElement(ast);
        switch (preparsedElement.type) {
            case PreparsedElementType.NG_CONTENT:
                if (this.ngNonBindableStackCount === 0) {
                    this.ngContentSelectors.push(preparsedElement.selectAttr);
                }
                break;
            case PreparsedElementType.STYLE:
                var textContent = '';
                ast.children.forEach(child => {
                    if (child instanceof HtmlTextAst) {
                        textContent += child.value;
                    }
                });
                this.styles.push(textContent);
                break;
            case PreparsedElementType.STYLESHEET:
                this.styleUrls.push(preparsedElement.hrefAttr);
                break;
            default:
                // DDC reports this as error. See:
                // https://github.com/dart-lang/dev_compiler/issues/428
                break;
        }
        if (preparsedElement.nonBindable) {
            this.ngNonBindableStackCount++;
        }
        htmlVisitAll(this, ast.children);
        if (preparsedElement.nonBindable) {
            this.ngNonBindableStackCount--;
        }
        return null;
    }
    visitComment(ast, context) { return null; }
    visitAttr(ast, context) { return null; }
    visitText(ast, context) { return null; }
    visitExpansion(ast, context) { return null; }
    visitExpansionCase(ast, context) { return null; }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVtcGxhdGVfbm9ybWFsaXplci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpZmZpbmdfcGx1Z2luX3dyYXBwZXItb3V0cHV0X3BhdGgtNFMxM05rTjkudG1wL2FuZ3VsYXIyL3NyYy9jb21waWxlci90ZW1wbGF0ZV9ub3JtYWxpemVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztPQUFPLEVBR0wsdUJBQXVCLEVBQ3hCLE1BQU0sc0JBQXNCO09BQ3RCLEVBQUMsU0FBUyxFQUFVLE1BQU0sMEJBQTBCO09BQ3BELEVBQUMsYUFBYSxFQUFDLE1BQU0sZ0NBQWdDO09BQ3JELEVBQUMsY0FBYyxFQUFDLE1BQU0sMkJBQTJCO09BRWpELEVBQUMsR0FBRyxFQUFDLE1BQU0sMkJBQTJCO09BQ3RDLEVBQUMsV0FBVyxFQUFDLE1BQU0sb0NBQW9DO09BQ3ZELEVBQUMsZ0JBQWdCLEVBQUUsb0JBQW9CLEVBQUMsTUFBTSxzQkFBc0I7T0FDcEUsRUFBQyxVQUFVLEVBQUMsTUFBTSxzQkFBc0I7T0FDeEMsRUFBQyxpQkFBaUIsRUFBQyxNQUFNLGlDQUFpQztPQUcxRCxFQUdMLFdBQVcsRUFNWCxZQUFZLEVBQ2IsTUFBTSxZQUFZO09BQ1osRUFBQyxVQUFVLEVBQUMsTUFBTSxlQUFlO09BRWpDLEVBQUMsZUFBZSxFQUFvQixvQkFBb0IsRUFBQyxNQUFNLHNCQUFzQjtBQUc1RjtJQUNFLFlBQW9CLElBQVMsRUFBVSxZQUF5QixFQUM1QyxXQUF1QjtRQUR2QixTQUFJLEdBQUosSUFBSSxDQUFLO1FBQVUsaUJBQVksR0FBWixZQUFZLENBQWE7UUFDNUMsZ0JBQVcsR0FBWCxXQUFXLENBQVk7SUFBRyxDQUFDO0lBRS9DLGlCQUFpQixDQUFDLGFBQWtDLEVBQ2xDLFFBQWlDO1FBQ2pELEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2pDLE1BQU0sQ0FBQyxjQUFjLENBQUMsT0FBTyxD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QUMsSUFBSSxDQUFDLENBQUMsQ0FBQztBQUNuRixDQUFDO0FBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICBDb21waWxlVHlwZU1ldGFkYXRhLFxuICBDb21waWxlRGlyZWN0aXZlTWV0YWRhdGEsXG4gIENvbXBpbGVUZW1wbGF0ZU1ldGFkYXRhXG59IGZyb20gJy4vZGlyZWN0aXZlX21ldGFkYXRhJztcbmltcG9ydCB7aXNQcmVzZW50LCBpc0JsYW5rfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtCYXNlRXhjZXB0aW9ufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2V4Y2VwdGlvbnMnO1xuaW1wb3J0IHtQcm9taXNlV3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9hc3luYyc7XG5cbmltcG9ydCB7WEhSfSBmcm9tICdhbmd1bGFyMi9zcmMvY29tcGlsZXIveGhyJztcbmltcG9ydCB7VXJsUmVzb2x2ZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb21waWxlci91cmxfcmVzb2x2ZXInO1xuaW1wb3J0IHtleHRyYWN0U3R5bGVVcmxzLCBpc1N0eWxlVXJsUmVzb2x2YWJsZX0gZnJvbSAnLi9zdHlsZV91cmxfcmVzb2x2ZXInO1xuaW1wb3J0IHtJbmplY3RhYmxlfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9kaSc7XG5pbXBvcnQge1ZpZXdFbmNhcHN1bGF0aW9ufSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9tZXRhZGF0YS92aWV3JztcblxuXG5pbXBvcnQge1xuICBIdG1sQXN0VmlzaXRvcixcbiAgSHRtbEVsZW1lbnRBc3QsXG4gIEh0bWxUZXh0QXN0LFxuICBIdG1sQXR0ckFzdCxcbiAgSHRtbEFzdCxcbiAgSHRtbENvbW1lbnRBc3QsXG4gIEh0bWxFeHBhbnNpb25Bc3QsXG4gIEh0bWxFeHBhbnNpb25DYXNlQXN0LFxuICBodG1sVmlzaXRBbGxcbn0gZnJvbSAnLi9odG1sX2FzdCc7XG5pbXBvcnQge0h0bWxQYXJzZXJ9IGZyb20gJy4vaHRtbF9wYXJzZXInO1xuXG5pbXBvcnQge3ByZXBhcnNlRWxlbWVudCwgUHJlcGFyc2VkRWxlbWVudCwgUHJlcGFyc2VkRWxlbWVudFR5cGV9IGZyb20gJy4vdGVtcGxhdGVfcHJlcGFyc2VyJztcblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIFRlbXBsYXRlTm9ybWFsaXplciB7XG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgX3hocjogWEhSLCBwcml2YXRlIF91cmxSZXNvbHZlcjogVXJsUmVzb2x2ZXIsXG4gICAgICAgICAgICAgIHByaXZhdGUgX2h0bWxQYXJzZXI6IEh0bWxQYXJzZXIpIHt9XG5cbiAgbm9ybWFsaXplVGVtcGxhdGUoZGlyZWN0aXZlVHlwZTogQ29tcGlsZVR5cGVNZXRhZGF0YSxcbiAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGU6IENvbXBpbGVUZW1wbGF0ZU1ldGFkYXRhKTogUHJvbWlzZTxDb21waWxlVGVtcGxhdGVNZXRhZGF0YT4ge1xuICAgIGlmIChpc1ByZXNlbnQodGVtcGxhdGUudGVtcGxhdGUpKSB7XG4gICAgICByZXR1cm4gUHJvbWlzZVdyYXBwZXIucmVzb2x2ZSh0aGlzLm5vcm1hbGl6ZUxvYWRlZFRlbXBsYXRlKFxuICAgICAgICAgIGRpcmVjdGl2ZVR5cGUsIHRlbXBsYXRlLCB0ZW1wbGF0ZS50ZW1wbGF0ZSwgZGlyZWN0aXZlVHlwZS5tb2R1bGVVcmwpKTtcbiAgICB9IGVsc2UgaWYgKGlzUHJlc2VudCh0ZW1wbGF0ZS50ZW1wbGF0ZVVybCkpIHtcbiAgICAgIHZhciBzb3VyY2VBYnNVcmwgPSB0aGlzLl91cmxSZXNvbHZlci5yZXNvbHZlKGRpcmVjdGl2ZVR5cGUubW9kdWxlVXJsLCB0ZW1wbGF0ZS50ZW1wbGF0ZVVybCk7XG4gICAgICByZXR1cm4gdGhpcy5feGhyLmdldChzb3VyY2VBYnNVcmwpXG4gICAgICAgICAgLnRoZW4odGVtcGxhdGVDb250ZW50ID0+IHRoaXMubm9ybWFsaXplTG9hZGVkVGVtcGxhdGUoZGlyZWN0aXZlVHlwZSwgdGVtcGxhdGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGVDb250ZW50LCBzb3VyY2VBYnNVcmwpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oYE5vIHRlbXBsYXRlIHNwZWNpZmllZCBmb3IgY29tcG9uZW50ICR7ZGlyZWN0aXZlVHlwZS5uYW1lfWApO1xuICAgIH1cbiAgfVxuXG4gIG5vcm1hbGl6ZUxvYWRlZFRlbXBsYXRlKGRpcmVjdGl2ZVR5cGU6IENvbXBpbGVUeXBlTWV0YWRhdGEsIHRlbXBsYXRlTWV0YTogQ29tcGlsZVRlbXBsYXRlTWV0YWRhdGEsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlOiBzdHJpbmcsIHRlbXBsYXRlQWJzVXJsOiBzdHJpbmcpOiBDb21waWxlVGVtcGxhdGVNZXRhZGF0YSB7XG4gICAgdmFyIHJvb3ROb2Rlc0FuZEVycm9ycyA9IHRoaXMuX2h0bWxQYXJzZXIucGFyc2UodGVtcGxhdGUsIGRpcmVjdGl2ZVR5cGUubmFtZSk7XG4gICAgaWYgKHJvb3ROb2Rlc0FuZEVycm9ycy5lcnJvcnMubGVuZ3RoID4gMCkge1xuICAgICAgdmFyIGVycm9yU3RyaW5nID0gcm9vdE5vZGVzQW5kRXJyb3JzLmVycm9ycy5qb2luKCdcXG4nKTtcbiAgICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKGBUZW1wbGF0ZSBwYXJzZSBlcnJvcnM6XFxuJHtlcnJvclN0cmluZ31gKTtcbiAgICB9XG5cbiAgICB2YXIgdmlzaXRvciA9IG5ldyBUZW1wbGF0ZVByZXBhcnNlVmlzaXRvcigpO1xuICAgIGh0bWxWaXNpdEFsbCh2aXNpdG9yLCByb290Tm9kZXNBbmRFcnJvcnMucm9vdE5vZGVzKTtcbiAgICB2YXIgYWxsU3R5bGVzID0gdGVtcGxhdGVNZXRhLnN0eWxlcy5jb25jYXQodmlzaXRvci5zdHlsZXMpO1xuXG4gICAgdmFyIGFsbFN0eWxlQWJzVXJscyA9XG4gICAgICAgIHZpc2l0b3Iuc3R5bGVVcmxzLmZpbHRlcihpc1N0eWxlVXJsUmVzb2x2YWJsZSlcbiAgICAgICAgICAgIC5tYXAodXJsID0+IHRoaXMuX3VybFJlc29sdmVyLnJlc29sdmUodGVtcGxhdGVBYnNVcmwsIHVybCkpXG4gICAgICAgICAgICAuY29uY2F0KHRlbXBsYXRlTWV0YS5zdHlsZVVybHMuZmlsdGVyKGlzU3R5bGVVcmxSZXNvbHZhYmxlKVxuICAgICAgICAgICAgICAgICAgICAgICAgLm1hcCh1cmwgPT4gdGhpcy5fdXJsUmVzb2x2ZXIucmVzb2x2ZShkaXJlY3RpdmVUeXBlLm1vZHVsZVVybCwgdXJsKSkpO1xuXG4gICAgdmFyIGFsbFJlc29sdmVkU3R5bGVzID0gYWxsU3R5bGVzLm1hcChzdHlsZSA9PiB7XG4gICAgICB2YXIgc3R5bGVXaXRoSW1wb3J0cyA9IGV4dHJhY3RTdHlsZVVybHModGhpcy5fdXJsUmVzb2x2ZXIsIHRlbXBsYXRlQWJzVXJsLCBzdHlsZSk7XG4gICAgICBzdHlsZVdpdGhJbXBvcnRzLnN0eWxlVXJscy5mb3JFYWNoKHN0eWxlVXJsID0+IGFsbFN0eWxlQWJzVXJscy5wdXNoKHN0eWxlVXJsKSk7XG4gICAgICByZXR1cm4gc3R5bGVXaXRoSW1wb3J0cy5zdHlsZTtcbiAgICB9KTtcblxuICAgIHZhciBlbmNhcHN1bGF0aW9uID0gdGVtcGxhdGVNZXRhLmVuY2Fwc3VsYXRpb247XG4gICAgaWYgKGVuY2Fwc3VsYXRpb24gPT09IFZpZXdFbmNhcHN1bGF0aW9uLkVtdWxhdGVkICYmIGFsbFJlc29sdmVkU3R5bGVzLmxlbmd0aCA9PT0gMCAmJlxuICAgICAgICBhbGxTdHlsZUFic1VybHMubGVuZ3RoID09PSAwKSB7XG4gICAgICBlbmNhcHN1bGF0aW9uID0gVmlld0VuY2Fwc3VsYXRpb24uTm9uZTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBDb21waWxlVGVtcGxhdGVNZXRhZGF0YSh7XG4gICAgICBlbmNhcHN1bGF0aW9uOiBlbmNhcHN1bGF0aW9uLFxuICAgICAgdGVtcGxhdGU6IHRlbXBsYXRlLFxuICAgICAgdGVtcGxhdGVVcmw6IHRlbXBsYXRlQWJzVXJsLFxuICAgICAgc3R5bGVzOiBhbGxSZXNvbHZlZFN0eWxlcyxcbiAgICAgIHN0eWxlVXJsczogYWxsU3R5bGVBYnNVcmxzLFxuICAgICAgbmdDb250ZW50U2VsZWN0b3JzOiB2aXNpdG9yLm5nQ29udGVudFNlbGVjdG9yc1xuICAgIH0pO1xuICB9XG59XG5cbmNsYXNzIFRlbXBsYXRlUHJlcGFyc2VWaXNpdG9yIGltcGxlbWVudHMgSHRtbEFzdFZpc2l0b3Ige1xuICBuZ0NvbnRlbnRTZWxlY3RvcnM6IHN0cmluZ1tdID0gW107XG4gIHN0eWxlczogc3RyaW5nW10gPSBbXTtcbiAgc3R5bGVVcmxzOiBzdHJpbmdbXSA9IFtdO1xuICBuZ05vbkJpbmRhYmxlU3RhY2tDb3VudDogbnVtYmVyID0gMDtcblxuICB2aXNpdEVsZW1lbnQoYXN0OiBIdG1sRWxlbWVudEFzdCwgY29udGV4dDogYW55KTogYW55IHtcbiAgICB2YXIgcHJlcGFyc2VkRWxlbWVudCA9IHByZXBhcnNlRWxlbWVudChhc3QpO1xuICAgIHN3aXRjaCAocHJlcGFyc2VkRWxlbWVudC50eXBlKSB7XG4gICAgICBjYXNlIFByZXBhcnNlZEVsZW1lbnRUeXBlLk5HX0NPTlRFTlQ6XG4gICAgICAgIGlmICh0aGlzLm5nTm9uQmluZGFibGVTdGFja0NvdW50ID09PSAwKSB7XG4gICAgICAgICAgdGhpcy5uZ0NvbnRlbnRTZWxlY3RvcnMucHVzaChwcmVwYXJzZWRFbGVtZW50LnNlbGVjdEF0dHIpO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBQcmVwYXJzZWRFbGVtZW50VHlwZS5TVFlMRTpcbiAgICAgICAgdmFyIHRleHRDb250ZW50ID0gJyc7XG4gICAgICAgIGFzdC5jaGlsZHJlbi5mb3JFYWNoKGNoaWxkID0+IHtcbiAgICAgICAgICBpZiAoY2hpbGQgaW5zdGFuY2VvZiBIdG1sVGV4dEFzdCkge1xuICAgICAgICAgICAgdGV4dENvbnRlbnQgKz0gKDxIdG1sVGV4dEFzdD5jaGlsZCkudmFsdWU7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5zdHlsZXMucHVzaCh0ZXh0Q29udGVudCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBQcmVwYXJzZWRFbGVtZW50VHlwZS5TVFlMRVNIRUVUOlxuICAgICAgICB0aGlzLnN0eWxlVXJscy5wdXNoKHByZXBhcnNlZEVsZW1lbnQuaHJlZkF0dHIpO1xuICAgICAgICBicmVhaztcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIC8vIEREQyByZXBvcnRzIHRoaXMgYXMgZXJyb3IuIFNlZTpcbiAgICAgICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL2RhcnQtbGFuZy9kZXZfY29tcGlsZXIvaXNzdWVzLzQyOFxuICAgICAgICBicmVhaztcbiAgICB9XG4gICAgaWYgKHByZXBhcnNlZEVsZW1lbnQubm9uQmluZGFibGUpIHtcbiAgICAgIHRoaXMubmdOb25CaW5kYWJsZVN0YWNrQ291bnQrKztcbiAgICB9XG4gICAgaHRtbFZpc2l0QWxsKHRoaXMsIGFzdC5jaGlsZHJlbik7XG4gICAgaWYgKHByZXBhcnNlZEVsZW1lbnQubm9uQmluZGFibGUpIHtcbiAgICAgIHRoaXMubmdOb25CaW5kYWJsZVN0YWNrQ291bnQtLTtcbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgdmlzaXRDb21tZW50KGFzdDogSHRtbENvbW1lbnRBc3QsIGNvbnRleHQ6IGFueSk6IGFueSB7IHJldHVybiBudWxsOyB9XG4gIHZpc2l0QXR0cihhc3Q6IEh0bWxBdHRyQXN0LCBjb250ZXh0OiBhbnkpOiBhbnkgeyByZXR1cm4gbnVsbDsgfVxuICB2aXNpdFRleHQoYXN0OiBIdG1sVGV4dEFzdCwgY29udGV4dDogYW55KTogYW55IHsgcmV0dXJuIG51bGw7IH1cbiAgdmlzaXRFeHBhbnNpb24oYXN0OiBIdG1sRXhwYW5zaW9uQXN0LCBjb250ZXh0OiBhbnkpOiBhbnkgeyByZXR1cm4gbnVsbDsgfVxuXG4gIHZpc2l0RXhwYW5zaW9uQ2FzZShhc3Q6IEh0bWxFeHBhbnNpb25DYXNlQXN0LCBjb250ZXh0OiBhbnkpOiBhbnkgeyByZXR1cm4gbnVsbDsgfVxufVxuIl19