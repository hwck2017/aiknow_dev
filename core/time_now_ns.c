#include <inttypes.h>
#include <stdio.h>
#include <stdint.h>
#include <mach/mach_time.h>

int main(void)
{
        uint64_t t = mach_absolute_time();
        mach_timebase_info_data_t data;
        mach_timebase_info(&data);
        // Convert to nanoseconds.
        t *= data.numer;
        t /= data.denom;
        printf("%" PRIu64 "\n", t);
        return 0;
}