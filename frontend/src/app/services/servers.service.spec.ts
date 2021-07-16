import { TestBed } from '@angular/core/testing';

import { ServersService } from './servers.service';

describe('HttpService', () => {
  let service: ServersService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ServersService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
