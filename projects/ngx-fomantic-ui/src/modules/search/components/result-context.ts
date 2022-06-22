import {ITemplateRefContext} from '../../../misc/util/internal';

export interface IResultContext<T> extends ITemplateRefContext<T> {
  query: string;
}
