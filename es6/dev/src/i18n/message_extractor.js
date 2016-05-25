import { HtmlElementAst } from 'angular2/src/compiler/html_ast';
import { isPresent } from 'angular2/src/facade/lang';
import { StringMapWrapper } from 'angular2/src/facade/collection';
import { id } from './message';
import { expandNodes } from './expander';
import { I18nError, I18N_ATTR_PREFIX, partition, messageFromAttribute } from './shared';
/**
 * All messages extracted from a template.
 */
export class ExtractionResult {
    constructor(messages, errors) {
        this.messages = messages;
        this.errors = errors;
    }
}
/**
 * Removes duplicate messages.
 *
 * E.g.
 *
 * ```
 *  var m = [new Message("message", "meaning", "desc1"), new Message("message", "meaning",
 * "desc2")];
 *  expect(removeDuplicates(m)).toEqual([new Message("message", "meaning", "desc1")]);
 * ```
 */
export function removeDuplicates(messages) {
    let uniq = {};
    messages.forEach(m => {
        if (!StringMapWrapper.contains(uniq, id(m))) {
            uniq[id(m)] = m;
        }
    });
    return StringMapWrapper.values(uniq);
}
/**
 * Extracts all messages from a template.
 *
 * Algorithm:
 *
 * To understand the algorithm, you need to know how partitioning works.
 * Partitioning is required as we can use two i18n comments to group node siblings together.
 * That is why we cannot just use nodes.
 *
 * Partitioning transforms an array of HtmlAst into an array of Part.
 * A part can optionally contain a root element or a root text node. And it can also contain
 * children.
 * A part can contain i18n property, in which case it needs to be extracted.
 *
 * Example:
 *
 * The following array of nodes will be split into four parts:
 *
 * ```
 * <a>A</a>
 * <b i18n>B</b>
 * <!-- i18n -->
 * <c>C</c>
 * D
 * <!-- /i18n -->
 * E
 * ```
 *
 * Part 1 containing the a tag. It should not be translated.
 * Part 2 containing the b tag. It should be translated.
 * Part 3 containing the c tag and the D text node. It should be translated.
 * Part 4 containing the E text node. It should not be translated..
 *
 * It is also important to understand how we stringify nodes to create a message.
 *
 * We walk the tree and replace every element node with a placeholder. We also replace
 * all expressions in interpolation with placeholders. We also insert a placeholder element
 * to wrap a text node containing interpolation.
 *
 * Example:
 *
 * The following tree:
 *
 * ```
 * <a>A{{I}}</a><b>B</b>
 * ```
 *
 * will be stringified into:
 * ```
 * <ph name="e0"><ph name="t1">A<ph name="0"/></ph></ph><ph name="e2">B</ph>
 * ```
 *
 * This is what the algorithm does:
 *
 * 1. Use the provided html parser to get the html AST of the template.
 * 2. Partition the root nodes, and process each part separately.
 * 3. If a part does not have the i18n attribute, recurse to process children and attributes.
 * 4. If a part has the i18n attribute, stringify the nodes to create a Message.
 */
export class MessageExtractor {
    constructor(_htmlParser, _parser) {
        this._htmlParser = _htmlParser;
        this._parser = _parser;
    }
    extract(template, sourceUrl) {
        this.messages = [];
        this.errors = [];
        let res = this._htmlParser.parse(template, sourceUrl, true);
        if (res.errors.length > 0) {
            return new ExtractionResult([], res.errors);
        }
        else {
            this._recurse(expandNodes(res.rootNodes).nodes);
            return new ExtractionResult(this.messages, this.errors);
        }
    }
    _extractMessagesFromPart(p) {
        if (p.hasI18n) {
            this.messages.push(p.createMessage(this._parser));
            this._recurseToExtractMessagesFromAttributes(p.children);
        }
        else {
            this._recurse(p.children);
        }
        if (isPresent(p.rootElement)) {
            this._extractMessagesFromAttributes(p.rootElement);
        }
    }
    _recurse(nodes) {
        if (isPresent(nodes)) {
            let ps = partition(nodes, this.errors);
            ps.forEach(p => this._extractMessagesFromPart(p));
        }
    }
    _recurseToExtractMessagesFromAttributes(nodes) {
        nodes.forEach(n => {
            if (n instanceof HtmlElementAst) {
                this._extractMessagesFromAttributes(n);
                this._recurseToExtractMessagesFromAttributes(n.children);
            }
        });
    }
    _extractMessagesFromAttributes(p) {
        p.attrs.forEach(attr => {
            if (attr.name.startsWith(I18N_ATTR_PREFIX)) {
                try {
                    this.messages.push(messageFromAttribute(this._parser, p, attr));
                }
                catch (e) {
                    if (e instanceof I18nError) {
                        this.errors.push(e);
                    }
                    else {
                        throw e;
                    }
                }
            }
        });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVzc2FnZV9leHRyYWN0b3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkaWZmaW5nX3BsdWdpbl93cmFwcGVyLW91dHB1dF9wYXRoLUVpWUtlMU15LnRtcC9hbmd1bGFyMi9zcmMvaTE4bi9tZXNzYWdlX2V4dHJhY3Rvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiT0FFTyxFQUdMLGNBQWMsRUFLZixNQUFNLGdDQUFnQztPQUNoQyxFQUFDLFNBQVMsRUFBVSxNQUFNLDBCQUEwQjtPQUNwRCxFQUFDLGdCQUFnQixFQUFDLE1BQU0sZ0NBQWdDO09BRXhELEVBQVUsRUFBRSxFQUFDLE1BQU0sV0FBVztPQUM5QixFQUFDLFdBQVcsRUFBQyxNQUFNLFlBQVk7T0FDL0IsRUFDTCxTQUFTLEVBRVQsZ0JBQWdCLEVBQ2hCLFNBQVMsRUFJVCxvQkFBb0IsRUFDckIsTUFBTSxVQUFVO0FBRWpCOztHQUVHO0FBQ0g7SUFDRSxZQUFtQixRQUFtQixFQUFTLE1BQW9CO1FBQWhELGFBQVEsR0FBUixRQUFRLENBQVc7UUFBUyxXQUFNLEdBQU4sTUFBTSxDQUFjO0lBQUcsQ0FBQztBQUN6RSxDQUFDO0FBRUQ7Ozs7Ozs7Ozs7R0FVRztBQUNILGlDQUFpQyxRQUFtQjtJQUNsRCxJQUFJLElBQUksR0FBNkIsRUFBRSxDQUFDO0lBQ3hDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNoQixFQUFFLENBQUMsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzVDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDbEIsQ0FBQztJQUNILENBQUMsQ0FBQyxDQUFDO0lBQ0gsTUFBTSxDQUFDLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUN2QyxDQUFDO0FBRUQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7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b0IsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO2dCQUNsRSxDQUFFO2dCQUFBLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ1gsRUFBRSxDQUFDLENBQUMsQ0FBQyxZQUFZLFNBQVMsQ0FBQyxDQUFDLENBQUM7d0JBQzNCLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUN0QixDQUFDO29CQUFDLElBQUksQ0FBQyxDQUFDO3dCQUNOLE1BQU0sQ0FBQyxDQUFDO29CQUNWLENBQUM7Z0JBQ0gsQ0FBQztZQUNILENBQUM7UUFDSCxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7QUFDSCxDQUFDO0FBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0h0bWxQYXJzZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb21waWxlci9odG1sX3BhcnNlcic7XG5pbXBvcnQge1BhcnNlU291cmNlU3BhbiwgUGFyc2VFcnJvcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvbXBpbGVyL3BhcnNlX3V0aWwnO1xuaW1wb3J0IHtcbiAgSHRtbEFzdCxcbiAgSHRtbEFzdFZpc2l0b3IsXG4gIEh0bWxFbGVtZW50QXN0LFxuICBIdG1sQXR0ckFzdCxcbiAgSHRtbFRleHRBc3QsXG4gIEh0bWxDb21tZW50QXN0LFxuICBodG1sVmlzaXRBbGxcbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvbXBpbGVyL2h0bWxfYXN0JztcbmltcG9ydCB7aXNQcmVzZW50LCBpc0JsYW5rfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtTdHJpbmdNYXBXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2NvbGxlY3Rpb24nO1xuaW1wb3J0IHtQYXJzZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2NoYW5nZV9kZXRlY3Rpb24vcGFyc2VyL3BhcnNlcic7XG5pbXBvcnQge01lc3NhZ2UsIGlkfSBmcm9tICcuL21lc3NhZ2UnO1xuaW1wb3J0IHtleHBhbmROb2Rlc30gZnJvbSAnLi9leHBhbmRlcic7XG5pbXBvcnQge1xuICBJMThuRXJyb3IsXG4gIFBhcnQsXG4gIEkxOE5fQVRUUl9QUkVGSVgsXG4gIHBhcnRpdGlvbixcbiAgbWVhbmluZyxcbiAgZGVzY3JpcHRpb24sXG4gIHN0cmluZ2lmeU5vZGVzLFxuICBtZXNzYWdlRnJvbUF0dHJpYnV0ZVxufSBmcm9tICcuL3NoYXJlZCc7XG5cbi8qKlxuICogQWxsIG1lc3NhZ2VzIGV4dHJhY3RlZCBmcm9tIGEgdGVtcGxhdGUuXG4gKi9cbmV4cG9ydCBjbGFzcyBFeHRyYWN0aW9uUmVzdWx0IHtcbiAgY29uc3RydWN0b3IocHVibGljIG1lc3NhZ2VzOiBNZXNzYWdlW10sIHB1YmxpYyBlcnJvcnM6IFBhcnNlRXJyb3JbXSkge31cbn1cblxuLyoqXG4gKiBSZW1vdmVzIGR1cGxpY2F0ZSBtZXNzYWdlcy5cbiAqXG4gKiBFLmcuXG4gKlxuICogYGBgXG4gKiAgdmFyIG0gPSBbbmV3IE1lc3NhZ2UoXCJtZXNzYWdlXCIsIFwibWVhbmluZ1wiLCBcImRlc2MxXCIpLCBuZXcgTWVzc2FnZShcIm1lc3NhZ2VcIiwgXCJtZWFuaW5nXCIsXG4gKiBcImRlc2MyXCIpXTtcbiAqICBleHBlY3QocmVtb3ZlRHVwbGljYXRlcyhtKSkudG9FcXVhbChbbmV3IE1lc3NhZ2UoXCJtZXNzYWdlXCIsIFwibWVhbmluZ1wiLCBcImRlc2MxXCIpXSk7XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlbW92ZUR1cGxpY2F0ZXMobWVzc2FnZXM6IE1lc3NhZ2VbXSk6IE1lc3NhZ2VbXSB7XG4gIGxldCB1bmlxOiB7W2tleTogc3RyaW5nXTogTWVzc2FnZX0gPSB7fTtcbiAgbWVzc2FnZXMuZm9yRWFjaChtID0+IHtcbiAgICBpZiAoIVN0cmluZ01hcFdyYXBwZXIuY29udGFpbnModW5pcSwgaWQobSkpKSB7XG4gICAgICB1bmlxW2lkKG0pXSA9IG07XG4gICAgfVxuICB9KTtcbiAgcmV0dXJuIFN0cmluZ01hcFdyYXBwZXIudmFsdWVzKHVuaXEpO1xufVxuXG4vKipcbiAqIEV4dHJhY3RzIGFsbCBtZXNzYWdlcyBmcm9tIGEgdGVtcGxhdGUuXG4gKlxuICogQWxnb3JpdGhtOlxuICpcbiAqIFRvIHVuZGVyc3RhbmQgdGhlIGFsZ29yaXRobSwgeW91IG5lZWQgdG8ga25vdyBob3cgcGFydGl0aW9uaW5nIHdvcmtzLlxuICogUGFydGl0aW9uaW5nIGlzIHJlcXVpcmVkIGFzIHdlIGNhbiB1c2UgdHdvIGkxOG4gY29tbWVudHMgdG8gZ3JvdXAgbm9kZSBzaWJsaW5ncyB0b2dldGhlci5cbiAqIFRoYXQgaXMgd2h5IHdlIGNhbm5vdCBqdXN0IHVzZSBub2Rlcy5cbiAqXG4gKiBQYXJ0aXRpb25pbmcgdHJhbnNmb3JtcyBhbiBhcnJheSBvZiBIdG1sQXN0IGludG8gYW4gYXJyYXkgb2YgUGFydC5cbiAqIEEgcGFydCBjYW4gb3B0aW9uYWxseSBjb250YWluIGEgcm9vdCBlbGVtZW50IG9yIGEgcm9vdCB0ZXh0IG5vZGUuIEFuZCBpdCBjYW4gYWxzbyBjb250YWluXG4gKiBjaGlsZHJlbi5cbiAqIEEgcGFydCBjYW4gY29udGFpbiBpMThuIHByb3BlcnR5LCBpbiB3aGljaCBjYXNlIGl0IG5lZWRzIHRvIGJlIGV4dHJhY3RlZC5cbiAqXG4gKiBFeGFtcGxlOlxuICpcbiAqIFRoZSBmb2xsb3dpbmcgYXJyYXkgb2Ygbm9kZXMgd2lsbCBiZSBzcGxpdCBpbnRvIGZvdXIgcGFydHM6XG4gKlxuICogYGBgXG4gKiA8YT5BPC9hPlxuICogPGIgaTE4bj5CPC9iPlxuICogPCEtLSBpMThuIC0tPlxuICogPGM+QzwvYz5cbiAqIERcbiAqIDwhLS0gL2kxOG4gLS0+XG4gKiBFXG4gKiBgYGBcbiAqXG4gKiBQYXJ0IDEgY29udGFpbmluZyB0aGUgYSB0YWcuIEl0IHNob3VsZCBub3QgYmUgdHJhbnNsYXRlZC5cbiAqIFBhcnQgMiBjb250YWluaW5nIHRoZSBiIHRhZy4gSXQgc2hvdWxkIGJlIHRyYW5zbGF0ZWQuXG4gKiBQYXJ0IDMgY29udGFpbmluZyB0aGUgYyB0YWcgYW5kIHRoZSBEIHRleHQgbm9kZS4gSXQgc2hvdWxkIGJlIHRyYW5zbGF0ZWQuXG4gKiBQYXJ0IDQgY29udGFpbmluZyB0aGUgRSB0ZXh0IG5vZGUuIEl0IHNob3VsZCBub3QgYmUgdHJhbnNsYXRlZC4uXG4gKlxuICogSXQgaXMgYWxzbyBpbXBvcnRhbnQgdG8gdW5kZXJzdGFuZCBob3cgd2Ugc3RyaW5naWZ5IG5vZGVzIHRvIGNyZWF0ZSBhIG1lc3NhZ2UuXG4gKlxuICogV2Ugd2FsayB0aGUgdHJlZSBhbmQgcmVwbGFjZSBldmVyeSBlbGVtZW50IG5vZGUgd2l0aCBhIHBsYWNlaG9sZGVyLiBXZSBhbHNvIHJlcGxhY2VcbiAqIGFsbCBleHByZXNzaW9ucyBpbiBpbnRlcnBvbGF0aW9uIHdpdGggcGxhY2Vob2xkZXJzLiBXZSBhbHNvIGluc2VydCBhIHBsYWNlaG9sZGVyIGVsZW1lbnRcbiAqIHRvIHdyYXAgYSB0ZXh0IG5vZGUgY29udGFpbmluZyBpbnRlcnBvbGF0aW9uLlxuICpcbiAqIEV4YW1wbGU6XG4gKlxuICogVGhlIGZvbGxvd2luZyB0cmVlOlxuICpcbiAqIGBgYFxuICogPGE+QXt7SX19PC9hPjxiPkI8L2I+XG4gKiBgYGBcbiAqXG4gKiB3aWxsIGJlIHN0cmluZ2lmaWVkIGludG86XG4gKiBgYGBcbiAqIDxwaCBuYW1lPVwiZTBcIj48cGggbmFtZT1cInQxXCI+QTxwaCBuYW1lPVwiMFwiLz48L3BoPjwvcGg+PHBoIG5hbWU9XCJlMlwiPkI8L3BoPlxuICogYGBgXG4gKlxuICogVGhpcyBpcyB3aGF0IHRoZSBhbGdvcml0aG0gZG9lczpcbiAqXG4gKiAxLiBVc2UgdGhlIHByb3ZpZGVkIGh0bWwgcGFyc2VyIHRvIGdldCB0aGUgaHRtbCBBU1Qgb2YgdGhlIHRlbXBsYXRlLlxuICogMi4gUGFydGl0aW9uIHRoZSByb290IG5vZGVzLCBhbmQgcHJvY2VzcyBlYWNoIHBhcnQgc2VwYXJhdGVseS5cbiAqIDMuIElmIGEgcGFydCBkb2VzIG5vdCBoYXZlIHRoZSBpMThuIGF0dHJpYnV0ZSwgcmVjdXJzZSB0byBwcm9jZXNzIGNoaWxkcmVuIGFuZCBhdHRyaWJ1dGVzLlxuICogNC4gSWYgYSBwYXJ0IGhhcyB0aGUgaTE4biBhdHRyaWJ1dGUsIHN0cmluZ2lmeSB0aGUgbm9kZXMgdG8gY3JlYXRlIGEgTWVzc2FnZS5cbiAqL1xuZXhwb3J0IGNsYXNzIE1lc3NhZ2VFeHRyYWN0b3Ige1xuICBtZXNzYWdlczogTWVzc2FnZVtdO1xuICBlcnJvcnM6IFBhcnNlRXJyb3JbXTtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9odG1sUGFyc2VyOiBIdG1sUGFyc2VyLCBwcml2YXRlIF9wYXJzZXI6IFBhcnNlcikge31cblxuICBleHRyYWN0KHRlbXBsYXRlOiBzdHJpbmcsIHNvdXJjZVVybDogc3RyaW5nKTogRXh0cmFjdGlvblJlc3VsdCB7XG4gICAgdGhpcy5tZXNzYWdlcyA9IFtdO1xuICAgIHRoaXMuZXJyb3JzID0gW107XG5cbiAgICBsZXQgcmVzID0gdGhpcy5faHRtbFBhcnNlci5wYXJzZSh0ZW1wbGF0ZSwgc291cmNlVXJsLCB0cnVlKTtcbiAgICBpZiAocmVzLmVycm9ycy5sZW5ndGggPiAwKSB7XG4gICAgICByZXR1cm4gbmV3IEV4dHJhY3Rpb25SZXN1bHQoW10sIHJlcy5lcnJvcnMpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9yZWN1cnNlKGV4cGFuZE5vZGVzKHJlcy5yb290Tm9kZXMpLm5vZGVzKTtcbiAgICAgIHJldHVybiBuZXcgRXh0cmFjdGlvblJlc3VsdCh0aGlzLm1lc3NhZ2VzLCB0aGlzLmVycm9ycyk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfZXh0cmFjdE1lc3NhZ2VzRnJvbVBhcnQocDogUGFydCk6IHZvaWQge1xuICAgIGlmIChwLmhhc0kxOG4pIHtcbiAgICAgIHRoaXMubWVzc2FnZXMucHVzaChwLmNyZWF0ZU1lc3NhZ2UodGhpcy5fcGFyc2VyKSk7XG4gICAgICB0aGlzLl9yZWN1cnNlVG9FeHRyYWN0TWVzc2FnZXNGcm9tQXR0cmlidXRlcyhwLmNoaWxkcmVuKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fcmVjdXJzZShwLmNoaWxkcmVuKTtcbiAgICB9XG5cbiAgICBpZiAoaXNQcmVzZW50KHAucm9vdEVsZW1lbnQpKSB7XG4gICAgICB0aGlzLl9leHRyYWN0TWVzc2FnZXNGcm9tQXR0cmlidXRlcyhwLnJvb3RFbGVtZW50KTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9yZWN1cnNlKG5vZGVzOiBIdG1sQXN0W10pOiB2b2lkIHtcbiAgICBpZiAoaXNQcmVzZW50KG5vZGVzKSkge1xuICAgICAgbGV0IHBzID0gcGFydGl0aW9uKG5vZGVzLCB0aGlzLmVycm9ycyk7XG4gICAgICBwcy5mb3JFYWNoKHAgPT4gdGhpcy5fZXh0cmFjdE1lc3NhZ2VzRnJvbVBhcnQocCkpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX3JlY3Vyc2VUb0V4dHJhY3RNZXNzYWdlc0Zyb21BdHRyaWJ1dGVzKG5vZGVzOiBIdG1sQXN0W10pOiB2b2lkIHtcbiAgICBub2Rlcy5mb3JFYWNoKG4gPT4ge1xuICAgICAgaWYgKG4gaW5zdGFuY2VvZiBIdG1sRWxlbWVudEFzdCkge1xuICAgICAgICB0aGlzLl9leHRyYWN0TWVzc2FnZXNGcm9tQXR0cmlidXRlcyhuKTtcbiAgICAgICAgdGhpcy5fcmVjdXJzZVRvRXh0cmFjdE1lc3NhZ2VzRnJvbUF0dHJpYnV0ZXMobi5jaGlsZHJlbik7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIF9leHRyYWN0TWVzc2FnZXNGcm9tQXR0cmlidXRlcyhwOiBIdG1sRWxlbWVudEFzdCk6IHZvaWQge1xuICAgIHAuYXR0cnMuZm9yRWFjaChhdHRyID0+IHtcbiAgICAgIGlmIChhdHRyLm5hbWUuc3RhcnRzV2l0aChJMThOX0FUVFJfUFJFRklYKSkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIHRoaXMubWVzc2FnZXMucHVzaChtZXNzYWdlRnJvbUF0dHJpYnV0ZSh0aGlzLl9wYXJzZXIsIHAsIGF0dHIpKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgIGlmIChlIGluc3RhbmNlb2YgSTE4bkVycm9yKSB7XG4gICAgICAgICAgICB0aGlzLmVycm9ycy5wdXNoKGUpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyBlO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICB9XG59Il19